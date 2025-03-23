
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { 
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger 
} from "@/components/ui/accordion";
import { Checkbox } from "@/components/ui/checkbox";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { Loader, Plus, Trash } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

type Dependant = {
  id: string;
  name: string;
  relationship: string;
  age: number;
};

export default function ClientForm() {
  const { profile } = useAuth();
  const navigate = useNavigate();
  
  // Personal details
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [city, setCity] = useState("");
  const [state, setState] = useState("");
  const [zip, setZip] = useState("");
  
  // Next of kin
  const [nokName, setNokName] = useState("");
  const [nokRelationship, setNokRelationship] = useState("");
  const [nokPhone, setNokPhone] = useState("");
  const [nokEmail, setNokEmail] = useState("");
  
  // Dependants
  const [dependants, setDependants] = useState<Dependant[]>([
    { id: "1", name: "", relationship: "", age: 0 }
  ]);
  
  // Payment details
  const [paymentMethod, setPaymentMethod] = useState("bank");
  const [bankName, setBankName] = useState("");
  const [accountNumber, setAccountNumber] = useState("");
  const [accountName, setAccountName] = useState("");
  
  // Declaration
  const [acceptTerms, setAcceptTerms] = useState(false);
  
  // Form state
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    
    // Personal details validation
    if (!firstName) newErrors.firstName = "First name is required";
    if (!lastName) newErrors.lastName = "Last name is required";
    if (!email) newErrors.email = "Email is required";
    else if (!/\S+@\S+\.\S+/.test(email)) newErrors.email = "Email is invalid";
    if (!phone) newErrors.phone = "Phone is required";
    if (!address) newErrors.address = "Address is required";
    if (!city) newErrors.city = "City is required";
    if (!state) newErrors.state = "State is required";
    if (!zip) newErrors.zip = "Postal/Zip code is required";
    
    // Next of kin validation
    if (!nokName) newErrors.nokName = "Next of kin name is required";
    if (!nokRelationship) newErrors.nokRelationship = "Relationship is required";
    if (!nokPhone) newErrors.nokPhone = "Next of kin phone is required";
    
    // Dependants validation
    dependants.forEach((dep, index) => {
      if (dep.name && !dep.relationship) {
        newErrors[`dep_${index}_relationship`] = "Relationship is required";
      }
      if (dep.name && dep.age <= 0) {
        newErrors[`dep_${index}_age`] = "Age must be greater than 0";
      }
    });
    
    // Payment details validation
    if (paymentMethod === "bank") {
      if (!bankName) newErrors.bankName = "Bank name is required";
      if (!accountNumber) newErrors.accountNumber = "Account number is required";
      if (!accountName) newErrors.accountName = "Account name is required";
    }
    
    // Declaration validation
    if (!acceptTerms) newErrors.acceptTerms = "You must accept the terms and conditions";
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleAddDependant = () => {
    setDependants([
      ...dependants,
      { id: `${dependants.length + 1}`, name: "", relationship: "", age: 0 }
    ]);
  };

  const handleRemoveDependant = (id: string) => {
    if (dependants.length > 1) {
      setDependants(dependants.filter(dep => dep.id !== id));
    }
  };

  const handleDependantChange = (id: string, field: keyof Dependant, value: string | number) => {
    setDependants(
      dependants.map(dep =>
        dep.id === id ? { ...dep, [field]: value } : dep
      )
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      toast.error("Please fill in all required fields");
      return;
    }
    
    try {
      setSubmitting(true);
      
      // Create client
      const { data: clientData, error: clientError } = await supabase
        .from("clients")
        .insert([
          {
            first_name: firstName,
            last_name: lastName,
            email,
            phone,
            address,
            city,
            state,
            zip,
            case_status: "pending",
            agent_id: profile?.id
          }
        ])
        .select()
        .single();
      
      if (clientError) throw clientError;
      
      const clientId = clientData.id;
      
      // Create next of kin
      await supabase.from("next_of_kin").insert([
        {
          client_id: clientId,
          name: nokName,
          relationship: nokRelationship,
          phone: nokPhone,
          email: nokEmail
        }
      ]);
      
      // Create dependants (only if they have names)
      const validDependants = dependants.filter(dep => dep.name.trim() !== "");
      if (validDependants.length > 0) {
        await supabase.from("dependants").insert(
          validDependants.map(dep => ({
            client_id: clientId,
            name: dep.name,
            relationship: dep.relationship,
            age: dep.age
          }))
        );
      }
      
      toast.success("Client registered successfully");
      navigate("/clients");
    } catch (error) {
      console.error("Error registering client:", error);
      toast.error("Failed to register client");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="animate-fade-in space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Register New Client</h1>
        <p className="text-muted-foreground">
          Fill in the client details to register them for legal aid
        </p>
      </div>
      
      <form onSubmit={handleSubmit} className="space-y-6">
        <Accordion type="single" collapsible defaultValue="personal">
          {/* Personal Details */}
          <AccordionItem value="personal" className="card-glass rounded-lg px-4">
            <AccordionTrigger className="text-lg font-medium">
              Personal Details
            </AccordionTrigger>
            <AccordionContent className="pt-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="firstName">
                    First Name <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="firstName"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    className={errors.firstName ? "border-destructive" : ""}
                  />
                  {errors.firstName && (
                    <p className="text-xs text-destructive">{errors.firstName}</p>
                  )}
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="lastName">
                    Last Name <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="lastName"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    className={errors.lastName ? "border-destructive" : ""}
                  />
                  {errors.lastName && (
                    <p className="text-xs text-destructive">{errors.lastName}</p>
                  )}
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="email">
                    Email <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className={errors.email ? "border-destructive" : ""}
                  />
                  {errors.email && (
                    <p className="text-xs text-destructive">{errors.email}</p>
                  )}
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="phone">
                    Phone <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="phone"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className={errors.phone ? "border-destructive" : ""}
                  />
                  {errors.phone && (
                    <p className="text-xs text-destructive">{errors.phone}</p>
                  )}
                </div>
                
                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="address">
                    Address <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="address"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    className={errors.address ? "border-destructive" : ""}
                  />
                  {errors.address && (
                    <p className="text-xs text-destructive">{errors.address}</p>
                  )}
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="city">
                    City <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="city"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    className={errors.city ? "border-destructive" : ""}
                  />
                  {errors.city && (
                    <p className="text-xs text-destructive">{errors.city}</p>
                  )}
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="state">
                    State <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="state"
                    value={state}
                    onChange={(e) => setState(e.target.value)}
                    className={errors.state ? "border-destructive" : ""}
                  />
                  {errors.state && (
                    <p className="text-xs text-destructive">{errors.state}</p>
                  )}
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="zip">
                    Postal/Zip Code <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="zip"
                    value={zip}
                    onChange={(e) => setZip(e.target.value)}
                    className={errors.zip ? "border-destructive" : ""}
                  />
                  {errors.zip && (
                    <p className="text-xs text-destructive">{errors.zip}</p>
                  )}
                </div>
              </div>
            </AccordionContent>
          </AccordionItem>
          
          {/* Next of Kin */}
          <AccordionItem value="nextOfKin" className="card-glass rounded-lg px-4">
            <AccordionTrigger className="text-lg font-medium">
              Next of Kin
            </AccordionTrigger>
            <AccordionContent className="pt-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="nokName">
                    Name <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="nokName"
                    value={nokName}
                    onChange={(e) => setNokName(e.target.value)}
                    className={errors.nokName ? "border-destructive" : ""}
                  />
                  {errors.nokName && (
                    <p className="text-xs text-destructive">{errors.nokName}</p>
                  )}
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="nokRelationship">
                    Relationship <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="nokRelationship"
                    value={nokRelationship}
                    onChange={(e) => setNokRelationship(e.target.value)}
                    className={errors.nokRelationship ? "border-destructive" : ""}
                  />
                  {errors.nokRelationship && (
                    <p className="text-xs text-destructive">{errors.nokRelationship}</p>
                  )}
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="nokPhone">
                    Phone <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="nokPhone"
                    value={nokPhone}
                    onChange={(e) => setNokPhone(e.target.value)}
                    className={errors.nokPhone ? "border-destructive" : ""}
                  />
                  {errors.nokPhone && (
                    <p className="text-xs text-destructive">{errors.nokPhone}</p>
                  )}
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="nokEmail">Email</Label>
                  <Input
                    id="nokEmail"
                    type="email"
                    value={nokEmail}
                    onChange={(e) => setNokEmail(e.target.value)}
                  />
                </div>
              </div>
            </AccordionContent>
          </AccordionItem>
          
          {/* Dependants */}
          <AccordionItem value="dependants" className="card-glass rounded-lg px-4">
            <AccordionTrigger className="text-lg font-medium">
              Dependants
            </AccordionTrigger>
            <AccordionContent className="pt-4">
              {dependants.map((dep, index) => (
                <div key={dep.id} className="mb-6 rounded-lg border p-4">
                  <div className="mb-4 flex items-center justify-between">
                    <h4 className="text-sm font-medium">
                      Dependant {index + 1}
                    </h4>
                    
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => handleRemoveDependant(dep.id)}
                      disabled={dependants.length === 1}
                    >
                      <Trash className="h-4 w-4 text-muted-foreground" />
                      <span className="sr-only">Remove</span>
                    </Button>
                  </div>
                  
                  <div className="grid gap-4 md:grid-cols-3">
                    <div className="space-y-2">
                      <Label htmlFor={`dep_${dep.id}_name`}>Name</Label>
                      <Input
                        id={`dep_${dep.id}_name`}
                        value={dep.name}
                        onChange={(e) => 
                          handleDependantChange(dep.id, "name", e.target.value)
                        }
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor={`dep_${dep.id}_relationship`}>Relationship</Label>
                      <Input
                        id={`dep_${dep.id}_relationship`}
                        value={dep.relationship}
                        onChange={(e) => 
                          handleDependantChange(dep.id, "relationship", e.target.value)
                        }
                        className={
                          errors[`dep_${index}_relationship`] ? "border-destructive" : ""
                        }
                      />
                      {errors[`dep_${index}_relationship`] && (
                        <p className="text-xs text-destructive">
                          {errors[`dep_${index}_relationship`]}
                        </p>
                      )}
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor={`dep_${dep.id}_age`}>Age</Label>
                      <Input
                        id={`dep_${dep.id}_age`}
                        type="number"
                        min="0"
                        value={dep.age}
                        onChange={(e) => 
                          handleDependantChange(dep.id, "age", parseInt(e.target.value) || 0)
                        }
                        className={
                          errors[`dep_${index}_age`] ? "border-destructive" : ""
                        }
                      />
                      {errors[`dep_${index}_age`] && (
                        <p className="text-xs text-destructive">
                          {errors[`dep_${index}_age`]}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              ))}
              
              <Button
                type="button"
                variant="outline"
                className="mt-2"
                onClick={handleAddDependant}
              >
                <Plus className="mr-2 h-4 w-4" />
                Add Another Dependant
              </Button>
            </AccordionContent>
          </AccordionItem>
          
          {/* Payment Details */}
          <AccordionItem value="payment" className="card-glass rounded-lg px-4">
            <AccordionTrigger className="text-lg font-medium">
              Payment Method
            </AccordionTrigger>
            <AccordionContent className="pt-4">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="paymentMethod">
                    Payment Method <span className="text-destructive">*</span>
                  </Label>
                  <Select
                    value={paymentMethod}
                    onValueChange={setPaymentMethod}
                  >
                    <SelectTrigger id="paymentMethod">
                      <SelectValue placeholder="Select payment method" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="bank">Bank Transfer</SelectItem>
                      <SelectItem value="cash">Cash</SelectItem>
                      <SelectItem value="cheque">Cheque</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                {paymentMethod === "bank" && (
                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="bankName">
                        Bank Name <span className="text-destructive">*</span>
                      </Label>
                      <Input
                        id="bankName"
                        value={bankName}
                        onChange={(e) => setBankName(e.target.value)}
                        className={errors.bankName ? "border-destructive" : ""}
                      />
                      {errors.bankName && (
                        <p className="text-xs text-destructive">{errors.bankName}</p>
                      )}
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="accountNumber">
                        Account Number <span className="text-destructive">*</span>
                      </Label>
                      <Input
                        id="accountNumber"
                        value={accountNumber}
                        onChange={(e) => setAccountNumber(e.target.value)}
                        className={errors.accountNumber ? "border-destructive" : ""}
                      />
                      {errors.accountNumber && (
                        <p className="text-xs text-destructive">{errors.accountNumber}</p>
                      )}
                    </div>
                    
                    <div className="space-y-2 md:col-span-2">
                      <Label htmlFor="accountName">
                        Account Name <span className="text-destructive">*</span>
                      </Label>
                      <Input
                        id="accountName"
                        value={accountName}
                        onChange={(e) => setAccountName(e.target.value)}
                        className={errors.accountName ? "border-destructive" : ""}
                      />
                      {errors.accountName && (
                        <p className="text-xs text-destructive">{errors.accountName}</p>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </AccordionContent>
          </AccordionItem>
          
          {/* Declaration */}
          <AccordionItem value="declaration" className="card-glass rounded-lg px-4">
            <AccordionTrigger className="text-lg font-medium">
              Declaration
            </AccordionTrigger>
            <AccordionContent className="pt-4">
              <div className="space-y-4">
                <div className="rounded-lg bg-muted/50 p-4">
                  <p className="text-sm text-muted-foreground">
                    By submitting this form, I confirm that all the information
                    provided is accurate and complete to the best of my knowledge.
                    I understand that providing false information may result in the
                    termination of legal aid services and potential legal consequences.
                  </p>
                </div>
                
                <div className="flex items-start space-x-2">
                  <Checkbox
                    id="acceptTerms"
                    checked={acceptTerms}
                    onCheckedChange={(checked) => 
                      setAcceptTerms(checked as boolean)
                    }
                    className={errors.acceptTerms ? "border-destructive" : ""}
                  />
                  <div className="grid gap-1.5 leading-none">
                    <Label
                      htmlFor="acceptTerms"
                      className={
                        errors.acceptTerms ? "text-destructive" : ""
                      }
                    >
                      I accept the terms and conditions
                    </Label>
                    {errors.acceptTerms && (
                      <p className="text-xs text-destructive">
                        {errors.acceptTerms}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </AccordionContent>
          </AccordionItem>
        </Accordion>
        
        <div className="flex justify-end space-x-4">
          <Button
            type="button"
            variant="outline"
            onClick={() => navigate("/clients")}
            disabled={submitting}
          >
            Cancel
          </Button>
          
          <Button type="submit" disabled={submitting}>
            {submitting ? (
              <>
                <Loader className="mr-2 h-4 w-4 animate-spin" />
                Registering...
              </>
            ) : (
              "Register Client"
            )}
          </Button>
        </div>
      </form>
    </div>
  );
}
