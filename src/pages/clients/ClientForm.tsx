
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { 
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger 
} from "@/components/ui/accordion";
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
import { format } from "date-fns";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { CalendarIcon } from "lucide-react";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";

type Dependant = {
  id: string;
  surname: string;
  firstName: string;
  idNumber: string;
  dateOfBirth: Date | undefined;
};

export default function ClientForm() {
  const { profile } = useAuth();
  const navigate = useNavigate();
  const currentDate = new Date();
  
  // Form sections
  const [activeSection, setActiveSection] = useState<string>("personal");
  
  // Personal details
  const [title, setTitle] = useState<string>("");
  const [surname, setSurname] = useState("");
  const [firstName, setFirstName] = useState("");
  const [whatsappNumber, setWhatsappNumber] = useState("");
  const [sex, setSex] = useState<string>("");
  const [dateOfBirth, setDateOfBirth] = useState<Date>();
  const [idNumber, setIdNumber] = useState("");
  const [address, setAddress] = useState("");
  const [maritalStatus, setMaritalStatus] = useState<string>("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [formNumber, setFormNumber] = useState("");
  
  // Employer details
  const [employerName, setEmployerName] = useState("");
  const [employeeNumber, setEmployeeNumber] = useState("");
  const [occupation, setOccupation] = useState("");
  const [employerAddress, setEmployerAddress] = useState("");
  const [employerEmail, setEmployerEmail] = useState("");
  const [employerPhone, setEmployerPhone] = useState("");
  
  // Next of kin
  const [nokFullName, setNokFullName] = useState("");
  const [nokDateOfBirth, setNokDateOfBirth] = useState<Date>();
  const [nokIdNumber, setNokIdNumber] = useState("");
  const [nokRelationship, setNokRelationship] = useState("");
  const [nokAddress, setNokAddress] = useState("");
  const [nokPhone, setNokPhone] = useState("");
  
  // Dependants
  const [dependants, setDependants] = useState<Dependant[]>([
    { id: "1", surname: "", firstName: "", idNumber: "", dateOfBirth: undefined }
  ]);
  
  // Subscription details
  const [planType, setPlanType] = useState<"individual" | "family">("individual");
  const [coverageTier, setCoverageTier] = useState<string>("");
  const [monthlyAmount, setMonthlyAmount] = useState<number>(0);
  
  // Payment details
  const [paymentMethod, setPaymentMethod] = useState<string>("");
  const [paymentFrequency, setPaymentFrequency] = useState<string>("");
  const [bankName, setBankName] = useState("");
  const [bankBranch, setBankBranch] = useState("");
  const [accountNumber, setAccountNumber] = useState("");
  const [accountHolder, setAccountHolder] = useState("");
  const [payDate, setPayDate] = useState<Date>();
  
  // Declaration
  const [acceptTerms, setAcceptTerms] = useState(false);
  
  // Form state
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Calculate subscription amount based on plan and tier
  const calculateSubscriptionAmount = (plan: string, tier: string): number => {
    const amounts = {
      individual: {
        bronze: 5,
        silver: 12,
        gold: 16,
        platinum: 20
      },
      family: {
        bronze: 10,
        silver: 20,
        gold: 25,
        platinum: 30
      }
    };
    
    if (plan === 'individual' && tier in amounts.individual) {
      return amounts.individual[tier as keyof typeof amounts.individual];
    } else if (plan === 'family' && tier in amounts.family) {
      return amounts.family[tier as keyof typeof amounts.family];
    }
    
    return 0;
  };

  // Update subscription amount when plan or tier changes
  const updateSubscriptionAmount = () => {
    if (planType && coverageTier) {
      const amount = calculateSubscriptionAmount(planType, coverageTier);
      setMonthlyAmount(amount);
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    
    // Personal details validation
    if (!title) newErrors.title = "Title is required";
    if (!surname) newErrors.surname = "Surname is required";
    if (!firstName) newErrors.firstName = "Name(s) is required";
    if (!whatsappNumber) newErrors.whatsappNumber = "WhatsApp number is required";
    if (!sex) newErrors.sex = "Sex is required";
    if (!dateOfBirth) newErrors.dateOfBirth = "Date of birth is required";
    if (!idNumber) newErrors.idNumber = "ID number is required";
    if (!address) newErrors.address = "Physical address is required";
    if (!maritalStatus) newErrors.maritalStatus = "Marital status is required";
    if (!phone) newErrors.phone = "Phone is required";
    if (email && !/\S+@\S+\.\S+/.test(email)) newErrors.email = "Email is invalid";
    
    // Employer details validation
    if (!employerName) newErrors.employerName = "Employer name is required";
    if (!employeeNumber) newErrors.employeeNumber = "Employee number is required";
    if (!occupation) newErrors.occupation = "Occupation is required";
    if (!employerAddress) newErrors.employerAddress = "Employer address is required";
    
    // Next of kin validation
    if (!nokFullName) newErrors.nokFullName = "Next of kin name is required";
    if (!nokDateOfBirth) newErrors.nokDateOfBirth = "Next of kin date of birth is required";
    if (!nokIdNumber) newErrors.nokIdNumber = "Next of kin ID number is required";
    if (!nokRelationship) newErrors.nokRelationship = "Relationship is required";
    if (!nokAddress) newErrors.nokAddress = "Next of kin address is required";
    if (!nokPhone) newErrors.nokPhone = "Next of kin phone is required";
    
    // Dependants validation (only if they have names)
    dependants.forEach((dep, index) => {
      if (dep.surname || dep.firstName) {
        if (!dep.surname) {
          newErrors[`dep_${index}_surname`] = "Surname is required";
        }
        if (!dep.firstName) {
          newErrors[`dep_${index}_firstName`] = "First name is required";
        }
        if (!dep.idNumber) {
          newErrors[`dep_${index}_idNumber`] = "ID number is required";
        }
        if (!dep.dateOfBirth) {
          newErrors[`dep_${index}_dateOfBirth`] = "Date of birth is required";
        }
      }
    });
    
    // Subscription details validation
    if (!planType) newErrors.planType = "Plan type is required";
    if (!coverageTier) newErrors.coverageTier = "Coverage tier is required";
    
    // Payment details validation
    if (!paymentMethod) newErrors.paymentMethod = "Payment method is required";
    if (!paymentFrequency) newErrors.paymentFrequency = "Payment frequency is required";
    
    if (['debit-order', 'stop-order'].includes(paymentMethod)) {
      if (!bankName) newErrors.bankName = "Bank name is required";
      if (!accountNumber) newErrors.accountNumber = "Account number is required";
      if (!accountHolder) newErrors.accountHolder = "Account holder name is required";
      if (!payDate) newErrors.payDate = "Pay date is required";
    }
    
    // Declaration validation
    if (!acceptTerms) newErrors.acceptTerms = "You must accept the declaration";
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleAddDependant = () => {
    if (dependants.length < 5) {
      setDependants([
        ...dependants,
        { id: `${dependants.length + 1}`, surname: "", firstName: "", idNumber: "", dateOfBirth: undefined }
      ]);
    } else {
      toast.warning("Maximum of 5 dependants allowed");
    }
  };

  const handleRemoveDependant = (id: string) => {
    if (dependants.length > 1) {
      setDependants(dependants.filter(dep => dep.id !== id));
    }
  };

  const handleDependantChange = (id: string, field: keyof Dependant, value: string | Date | undefined) => {
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
      
      // Find the first error and scroll to that section
      const firstErrorSection = Object.keys(errors)[0]?.split('_')[0];
      if (firstErrorSection) {
        setActiveSection(firstErrorSection);
      }
      
      return;
    }
    
    try {
      setSubmitting(true);
      
      // Format dates for database
      const formattedDateOfBirth = dateOfBirth ? format(dateOfBirth, 'yyyy-MM-dd') : '';
      const formattedNokDateOfBirth = nokDateOfBirth ? format(nokDateOfBirth, 'yyyy-MM-dd') : '';
      const formattedPayDate = payDate ? format(payDate, 'yyyy-MM-dd') : '';
      const dateJoined = format(currentDate, 'yyyy-MM-dd');
      
      // Handle mock database operations if using placeholder Supabase
      const isMockSupabase = supabase.supabaseUrl === 'https://placeholder-url.supabase.co';
      
      if (isMockSupabase) {
        toast.success("Client registered successfully (Demo Mode)");
        navigate("/clients");
        return;
      }
      
      // Create client
      const { data: clientData, error: clientError } = await supabase
        .from("clients")
        .insert([
          {
            title,
            surname,
            first_name: firstName,
            whatsapp_number: whatsappNumber,
            sex,
            date_of_birth: formattedDateOfBirth,
            id_number: idNumber,
            address,
            marital_status: maritalStatus,
            phone,
            email,
            case_status: "pending",
            agent_id: profile?.id,
            date_joined: dateJoined,
            form_number: formNumber || null
          }
        ])
        .select()
        .single();
      
      if (clientError) throw clientError;
      
      const clientId = clientData.id;
      
      // Create employer record
      await supabase.from("employers").insert([
        {
          client_id: clientId,
          name: employerName,
          employee_number: employeeNumber,
          occupation,
          address: employerAddress,
          email: employerEmail,
          phone: employerPhone
        }
      ]);
      
      // Create next of kin
      await supabase.from("next_of_kin").insert([
        {
          client_id: clientId,
          full_name: nokFullName,
          date_of_birth: formattedNokDateOfBirth,
          id_number: nokIdNumber,
          relationship: nokRelationship,
          address: nokAddress,
          phone: nokPhone
        }
      ]);
      
      // Create dependants (only if they have names)
      const validDependants = dependants.filter(dep => dep.surname.trim() !== "" && dep.firstName.trim() !== "");
      if (validDependants.length > 0) {
        await supabase.from("dependants").insert(
          validDependants.map(dep => ({
            client_id: clientId,
            surname: dep.surname,
            first_name: dep.firstName,
            id_number: dep.idNumber,
            date_of_birth: dep.dateOfBirth ? format(dep.dateOfBirth, 'yyyy-MM-dd') : ''
          }))
        );
      }
      
      // Create subscription record
      await supabase.from("subscriptions").insert([
        {
          client_id: clientId,
          plan_type: planType,
          coverage_tier: coverageTier,
          monthly_amount: monthlyAmount,
          payment_method: paymentMethod,
          payment_frequency: paymentFrequency,
          bank_name: bankName || null,
          bank_branch: bankBranch || null,
          account_number: accountNumber || null,
          account_holder: accountHolder || null,
          pay_date: formattedPayDate || null
        }
      ]);
      
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
        <Accordion 
          type="single" 
          collapsible 
          defaultValue="personal"
          value={activeSection}
          onValueChange={setActiveSection}
        >
          {/* Personal Details */}
          <AccordionItem value="personal" className="card-glass rounded-lg px-4">
            <AccordionTrigger className="text-lg font-medium">
              Principal Member's Personal Details
            </AccordionTrigger>
            <AccordionContent className="pt-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="title">
                    Title <span className="text-destructive">*</span>
                  </Label>
                  <Select 
                    value={title} 
                    onValueChange={setTitle}
                  >
                    <SelectTrigger id="title" className={errors.title ? "border-destructive" : ""}>
                      <SelectValue placeholder="Select title" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="mr">Mr</SelectItem>
                      <SelectItem value="mrs">Mrs</SelectItem>
                      <SelectItem value="miss">Miss</SelectItem>
                      <SelectItem value="ms">Ms</SelectItem>
                      <SelectItem value="dr">Dr</SelectItem>
                      <SelectItem value="prof">Prof</SelectItem>
                    </SelectContent>
                  </Select>
                  {errors.title && (
                    <p className="text-xs text-destructive">{errors.title}</p>
                  )}
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="sex">
                    Sex <span className="text-destructive">*</span>
                  </Label>
                  <RadioGroup 
                    value={sex} 
                    onValueChange={setSex}
                    className="flex space-x-4"
                  >
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="male" id="male" />
                      <Label htmlFor="male">Male</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="female" id="female" />
                      <Label htmlFor="female">Female</Label>
                    </div>
                  </RadioGroup>
                  {errors.sex && (
                    <p className="text-xs text-destructive">{errors.sex}</p>
                  )}
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="surname">
                    Surname <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="surname"
                    value={surname}
                    onChange={(e) => setSurname(e.target.value)}
                    className={errors.surname ? "border-destructive" : ""}
                  />
                  {errors.surname && (
                    <p className="text-xs text-destructive">{errors.surname}</p>
                  )}
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="firstName">
                    Name(s) <span className="text-destructive">*</span>
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
                  <Label htmlFor="dateOfBirth">
                    Date of Birth <span className="text-destructive">*</span>
                  </Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={cn(
                          "w-full justify-start text-left font-normal",
                          !dateOfBirth && "text-muted-foreground",
                          errors.dateOfBirth && "border-destructive"
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {dateOfBirth ? format(dateOfBirth, "PPP") : "Select date"}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <Calendar
                        mode="single"
                        selected={dateOfBirth}
                        onSelect={setDateOfBirth}
                        initialFocus
                        disabled={(date) => date > new Date()}
                      />
                    </PopoverContent>
                  </Popover>
                  {errors.dateOfBirth && (
                    <p className="text-xs text-destructive">{errors.dateOfBirth}</p>
                  )}
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="idNumber">
                    ID Number <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="idNumber"
                    value={idNumber}
                    onChange={(e) => setIdNumber(e.target.value)}
                    className={errors.idNumber ? "border-destructive" : ""}
                  />
                  {errors.idNumber && (
                    <p className="text-xs text-destructive">{errors.idNumber}</p>
                  )}
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="maritalStatus">
                    Marital Status <span className="text-destructive">*</span>
                  </Label>
                  <Select 
                    value={maritalStatus} 
                    onValueChange={setMaritalStatus}
                  >
                    <SelectTrigger 
                      id="maritalStatus" 
                      className={errors.maritalStatus ? "border-destructive" : ""}
                    >
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="single">Single</SelectItem>
                      <SelectItem value="married">Married</SelectItem>
                    </SelectContent>
                  </Select>
                  {errors.maritalStatus && (
                    <p className="text-xs text-destructive">{errors.maritalStatus}</p>
                  )}
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="whatsappNumber">
                    WhatsApp Number <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="whatsappNumber"
                    value={whatsappNumber}
                    onChange={(e) => setWhatsappNumber(e.target.value)}
                    className={errors.whatsappNumber ? "border-destructive" : ""}
                  />
                  {errors.whatsappNumber && (
                    <p className="text-xs text-destructive">{errors.whatsappNumber}</p>
                  )}
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="phone">
                    Telephone/Cellphone <span className="text-destructive">*</span>
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
                
                <div className="space-y-2">
                  <Label htmlFor="email">
                    Email Address
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
                
                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="address">
                    Physical Address <span className="text-destructive">*</span>
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
                  <Label htmlFor="formNumber">
                    Form Number
                  </Label>
                  <Input
                    id="formNumber"
                    value={formNumber}
                    onChange={(e) => setFormNumber(e.target.value)}
                  />
                </div>
              </div>
            </AccordionContent>
          </AccordionItem>
          
          {/* Employer Details */}
          <AccordionItem value="employer" className="card-glass rounded-lg px-4">
            <AccordionTrigger className="text-lg font-medium">
              Employer's Details
            </AccordionTrigger>
            <AccordionContent className="pt-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="employerName">
                    Name of Employer <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="employerName"
                    value={employerName}
                    onChange={(e) => setEmployerName(e.target.value)}
                    className={errors.employerName ? "border-destructive" : ""}
                  />
                  {errors.employerName && (
                    <p className="text-xs text-destructive">{errors.employerName}</p>
                  )}
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="employeeNumber">
                    Employee (EC) Number <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="employeeNumber"
                    value={employeeNumber}
                    onChange={(e) => setEmployeeNumber(e.target.value)}
                    className={errors.employeeNumber ? "border-destructive" : ""}
                  />
                  {errors.employeeNumber && (
                    <p className="text-xs text-destructive">{errors.employeeNumber}</p>
                  )}
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="occupation">
                    Occupation <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="occupation"
                    value={occupation}
                    onChange={(e) => setOccupation(e.target.value)}
                    className={errors.occupation ? "border-destructive" : ""}
                  />
                  {errors.occupation && (
                    <p className="text-xs text-destructive">{errors.occupation}</p>
                  )}
                </div>
                
                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="employerAddress">
                    Employer's Physical Address <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="employerAddress"
                    value={employerAddress}
                    onChange={(e) => setEmployerAddress(e.target.value)}
                    className={errors.employerAddress ? "border-destructive" : ""}
                  />
                  {errors.employerAddress && (
                    <p className="text-xs text-destructive">{errors.employerAddress}</p>
                  )}
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="employerEmail">
                    Employer's Email Address
                  </Label>
                  <Input
                    id="employerEmail"
                    type="email"
                    value={employerEmail}
                    onChange={(e) => setEmployerEmail(e.target.value)}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="employerPhone">
                    Employer's Telephone Number
                  </Label>
                  <Input
                    id="employerPhone"
                    value={employerPhone}
                    onChange={(e) => setEmployerPhone(e.target.value)}
                  />
                </div>
              </div>
            </AccordionContent>
          </AccordionItem>
          
          {/* Next of Kin */}
          <AccordionItem value="nextOfKin" className="card-glass rounded-lg px-4">
            <AccordionTrigger className="text-lg font-medium">
              Next of Kin Details
            </AccordionTrigger>
            <AccordionContent className="pt-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="nokFullName">
                    Full Name <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="nokFullName"
                    value={nokFullName}
                    onChange={(e) => setNokFullName(e.target.value)}
                    className={errors.nokFullName ? "border-destructive" : ""}
                  />
                  {errors.nokFullName && (
                    <p className="text-xs text-destructive">{errors.nokFullName}</p>
                  )}
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="nokDateOfBirth">
                    Date of Birth <span className="text-destructive">*</span>
                  </Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={cn(
                          "w-full justify-start text-left font-normal",
                          !nokDateOfBirth && "text-muted-foreground",
                          errors.nokDateOfBirth && "border-destructive"
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {nokDateOfBirth ? format(nokDateOfBirth, "PPP") : "Select date"}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <Calendar
                        mode="single"
                        selected={nokDateOfBirth}
                        onSelect={setNokDateOfBirth}
                        initialFocus
                        disabled={(date) => date > new Date()}
                      />
                    </PopoverContent>
                  </Popover>
                  {errors.nokDateOfBirth && (
                    <p className="text-xs text-destructive">{errors.nokDateOfBirth}</p>
                  )}
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="nokIdNumber">
                    ID Number <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="nokIdNumber"
                    value={nokIdNumber}
                    onChange={(e) => setNokIdNumber(e.target.value)}
                    className={errors.nokIdNumber ? "border-destructive" : ""}
                  />
                  {errors.nokIdNumber && (
                    <p className="text-xs text-destructive">{errors.nokIdNumber}</p>
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
                
                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="nokAddress">
                    Physical Address <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="nokAddress"
                    value={nokAddress}
                    onChange={(e) => setNokAddress(e.target.value)}
                    className={errors.nokAddress ? "border-destructive" : ""}
                  />
                  {errors.nokAddress && (
                    <p className="text-xs text-destructive">{errors.nokAddress}</p>
                  )}
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="nokPhone">
                    Cell Number(s) <span className="text-destructive">*</span>
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
              </div>
            </AccordionContent>
          </AccordionItem>
          
          {/* Dependants */}
          <AccordionItem value="dependants" className="card-glass rounded-lg px-4">
            <AccordionTrigger className="text-lg font-medium">
              Family / Other Dependants Details
            </AccordionTrigger>
            <AccordionContent className="pt-4">
              <div className="mb-4 rounded-md bg-blue-50 p-3 text-sm text-blue-800">
                <p>You can add up to 5 dependants. Only filled entries will be saved.</p>
              </div>
              
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
                  
                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor={`dep_${dep.id}_surname`}>Surname</Label>
                      <Input
                        id={`dep_${dep.id}_surname`}
                        value={dep.surname}
                        onChange={(e) => 
                          handleDependantChange(dep.id, "surname", e.target.value)
                        }
                        className={
                          errors[`dep_${index}_surname`] ? "border-destructive" : ""
                        }
                      />
                      {errors[`dep_${index}_surname`] && (
                        <p className="text-xs text-destructive">
                          {errors[`dep_${index}_surname`]}
                        </p>
                      )}
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor={`dep_${dep.id}_firstName`}>Name</Label>
                      <Input
                        id={`dep_${dep.id}_firstName`}
                        value={dep.firstName}
                        onChange={(e) => 
                          handleDependantChange(dep.id, "firstName", e.target.value)
                        }
                        className={
                          errors[`dep_${index}_firstName`] ? "border-destructive" : ""
                        }
                      />
                      {errors[`dep_${index}_firstName`] && (
                        <p className="text-xs text-destructive">
                          {errors[`dep_${index}_firstName`]}
                        </p>
                      )}
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor={`dep_${dep.id}_idNumber`}>ID Number</Label>
                      <Input
                        id={`dep_${dep.id}_idNumber`}
                        value={dep.idNumber}
                        onChange={(e) => 
                          handleDependantChange(dep.id, "idNumber", e.target.value)
                        }
                        className={
                          errors[`dep_${index}_idNumber`] ? "border-destructive" : ""
                        }
                      />
                      {errors[`dep_${index}_idNumber`] && (
                        <p className="text-xs text-destructive">
                          {errors[`dep_${index}_idNumber`]}
                        </p>
                      )}
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor={`dep_${dep.id}_dateOfBirth`}>Date of Birth</Label>
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button
                            variant="outline"
                            className={cn(
                              "w-full justify-start text-left font-normal",
                              !dep.dateOfBirth && "text-muted-foreground",
                              errors[`dep_${index}_dateOfBirth`] && "border-destructive"
                            )}
                          >
                            <CalendarIcon className="mr-2 h-4 w-4" />
                            {dep.dateOfBirth ? format(dep.dateOfBirth, "PPP") : "Select date"}
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0">
                          <Calendar
                            mode="single"
                            selected={dep.dateOfBirth}
                            onSelect={(date) => 
                              handleDependantChange(dep.id, "dateOfBirth", date)
                            }
                            initialFocus
                            disabled={(date) => date > new Date()}
                          />
                        </PopoverContent>
                      </Popover>
                      {errors[`dep_${index}_dateOfBirth`] && (
                        <p className="text-xs text-destructive">
                          {errors[`dep_${index}_dateOfBirth`]}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              ))}
              
              {dependants.length < 5 && (
                <Button
                  type="button"
                  variant="outline"
                  className="mt-2"
                  onClick={handleAddDependant}
                >
                  <Plus className="mr-2 h-4 w-4" />
                  Add Another Dependant
                </Button>
              )}
            </AccordionContent>
          </AccordionItem>
          
          {/* Subscription Details */}
          <AccordionItem value="subscription" className="card-glass rounded-lg px-4">
            <AccordionTrigger className="text-lg font-medium">
              Plan & Cover Selection
            </AccordionTrigger>
            <AccordionContent className="pt-4">
              <div className="space-y-6">
                <div className="space-y-2">
                  <Label>Choose Plan <span className="text-destructive">*</span></Label>
                  <RadioGroup 
                    value={planType} 
                    onValueChange={(value) => {
                      setPlanType(value as "individual" | "family");
                      updateSubscriptionAmount();
                    }}
                    className="flex space-x-4"
                  >
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="individual" id="individual" />
                      <Label htmlFor="individual">Individual</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="family" id="family" />
                      <Label htmlFor="family">Family</Label>
                    </div>
                  </RadioGroup>
                  {errors.planType && (
                    <p className="text-xs text-destructive">{errors.planType}</p>
                  )}
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="coverageTier">
                    Premium Cover Tier <span className="text-destructive">*</span>
                  </Label>
                  <Select 
                    value={coverageTier} 
                    onValueChange={(value) => {
                      setCoverageTier(value);
                      updateSubscriptionAmount();
                    }}
                  >
                    <SelectTrigger 
                      id="coverageTier" 
                      className={errors.coverageTier ? "border-destructive" : ""}
                    >
                      <SelectValue placeholder="Select coverage tier" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="bronze">Bronze – US$1000</SelectItem>
                      <SelectItem value="silver">Silver – US$2000</SelectItem>
                      <SelectItem value="gold">Gold – US$3000</SelectItem>
                      <SelectItem value="platinum">Platinum – US$4000</SelectItem>
                    </SelectContent>
                  </Select>
                  {errors.coverageTier && (
                    <p className="text-xs text-destructive">{errors.coverageTier}</p>
                  )}
                </div>
                
                <div className="rounded-md bg-muted/50 p-4">
                  <div className="flex justify-between">
                    <h3 className="font-medium">Monthly Subscription Amount:</h3>
                    <p className="font-semibold text-primary">${monthlyAmount.toFixed(2)}</p>
                  </div>
                  <div className="mt-2 text-xs text-muted-foreground">
                    <p>Individual Plan: Bronze $5 / Silver $12 / Gold $16 / Platinum $20</p>
                    <p>Family Plan: Bronze $10 / Silver $20 / Gold $25 / Platinum $30</p>
                  </div>
                </div>
              </div>
            </AccordionContent>
          </AccordionItem>
          
          {/* Payment Details */}
          <AccordionItem value="payment" className="card-glass rounded-lg px-4">
            <AccordionTrigger className="text-lg font-medium">
              Payment Method & Frequency
            </AccordionTrigger>
            <AccordionContent className="pt-4">
              <div className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="paymentMethod">
                    Mode of Payment <span className="text-destructive">*</span>
                  </Label>
                  <Select
                    value={paymentMethod}
                    onValueChange={setPaymentMethod}
                  >
                    <SelectTrigger 
                      id="paymentMethod"
                      className={errors.paymentMethod ? "border-destructive" : ""}
                    >
                      <SelectValue placeholder="Select payment method" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="cash">Cash</SelectItem>
                      <SelectItem value="ecocash">Ecocash</SelectItem>
                      <SelectItem value="telecash">Telecash</SelectItem>
                      <SelectItem value="one-wallet">One-Wallet</SelectItem>
                      <SelectItem value="debit-order">Debit Order</SelectItem>
                      <SelectItem value="stop-order">Stop Order</SelectItem>
                    </SelectContent>
                  </Select>
                  {errors.paymentMethod && (
                    <p className="text-xs text-destructive">{errors.paymentMethod}</p>
                  )}
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="paymentFrequency">
                    Payment Frequency <span className="text-destructive">*</span>
                  </Label>
                  <Select
                    value={paymentFrequency}
                    onValueChange={setPaymentFrequency}
                  >
                    <SelectTrigger 
                      id="paymentFrequency"
                      className={errors.paymentFrequency ? "border-destructive" : ""}
                    >
                      <SelectValue placeholder="Select payment frequency" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="quarterly">Quarterly</SelectItem>
                      <SelectItem value="half-yearly">Half-Yearly</SelectItem>
                      <SelectItem value="annually">Annually</SelectItem>
                    </SelectContent>
                  </Select>
                  {errors.paymentFrequency && (
                    <p className="text-xs text-destructive">{errors.paymentFrequency}</p>
                  )}
                </div>
                
                {['debit-order', 'stop-order'].includes(paymentMethod) && (
                  <div className="mt-4 rounded-lg border border-muted p-4">
                    <h3 className="mb-4 font-medium">Banking Details</h3>
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
                        <Label htmlFor="bankBranch">
                          Branch
                        </Label>
                        <Input
                          id="bankBranch"
                          value={bankBranch}
                          onChange={(e) => setBankBranch(e.target.value)}
                        />
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
                      
                      <div className="space-y-2">
                        <Label htmlFor="accountHolder">
                          Account Holder's Name <span className="text-destructive">*</span>
                        </Label>
                        <Input
                          id="accountHolder"
                          value={accountHolder}
                          onChange={(e) => setAccountHolder(e.target.value)}
                          className={errors.accountHolder ? "border-destructive" : ""}
                        />
                        {errors.accountHolder && (
                          <p className="text-xs text-destructive">{errors.accountHolder}</p>
                        )}
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="payDate">
                          Pay Date <span className="text-destructive">*</span>
                        </Label>
                        <Popover>
                          <PopoverTrigger asChild>
                            <Button
                              variant="outline"
                              className={cn(
                                "w-full justify-start text-left font-normal",
                                !payDate && "text-muted-foreground",
                                errors.payDate && "border-destructive"
                              )}
                            >
                              <CalendarIcon className="mr-2 h-4 w-4" />
                              {payDate ? format(payDate, "PPP") : "Select date"}
                            </Button>
                          </PopoverTrigger>
                          <PopoverContent className="w-auto p-0">
                            <Calendar
                              mode="single"
                              selected={payDate}
                              onSelect={setPayDate}
                              initialFocus
                            />
                          </PopoverContent>
                        </Popover>
                        {errors.payDate && (
                          <p className="text-xs text-destructive">{errors.payDate}</p>
                        )}
                      </div>
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
                    I hereby declare that the information provided in this form is true and complete to the best of my knowledge. 
                    I understand that any false statements or misrepresentation of facts may result in the cancellation of my 
                    membership and legal aid benefits. I also agree to the terms and conditions of the Legal Aid scheme.
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
                      I accept the above declaration
                    </Label>
                    {errors.acceptTerms && (
                      <p className="text-xs text-destructive">
                        {errors.acceptTerms}
                      </p>
                    )}
                  </div>
                </div>
                
                <div className="mt-4 grid gap-2 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label>Client's Signature</Label>
                    <div className="h-16 rounded-md border border-input bg-muted/20"></div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label>Date</Label>
                    <Input value={format(currentDate, "PPP")} disabled />
                  </div>
                </div>
                
                <div className="mt-6 rounded-md border-t border-dashed border-muted pt-4">
                  <h3 className="mb-2 text-sm font-medium">For Office Use Only</h3>
                  <div className="grid gap-2 md:grid-cols-3">
                    <div className="space-y-2">
                      <Label>Document Verified By</Label>
                      <Input disabled />
                    </div>
                    
                    <div className="space-y-2">
                      <Label>Signature</Label>
                      <div className="h-10 rounded-md border border-input bg-muted/20"></div>
                    </div>
                    
                    <div className="space-y-2">
                      <Label>Date</Label>
                      <Input disabled />
                    </div>
                    
                    <div className="space-y-2">
                      <Label>Policy Number</Label>
                      <Input disabled />
                    </div>
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
