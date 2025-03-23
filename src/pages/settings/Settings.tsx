
import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { UserPlus, User, Shield, Lock } from "lucide-react";
import { Link } from "react-router-dom";

export default function Settings() {
  const { profile } = useAuth();
  const isAdmin = profile?.role === "admin";

  return (
    <div className="animate-fade-in space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
          <p className="text-muted-foreground">
            Manage your account and application settings
          </p>
        </div>
      </div>

      <Tabs defaultValue={isAdmin ? "user" : "account"}>
        <TabsList className="w-full">
          <TabsTrigger value="account" className="flex-1">
            <User className="mr-2 h-4 w-4" />
            My Account
          </TabsTrigger>
          {isAdmin && (
            <TabsTrigger value="user" className="flex-1">
              <UserPlus className="mr-2 h-4 w-4" />
              User Management
            </TabsTrigger>
          )}
          <TabsTrigger value="security" className="flex-1">
            <Shield className="mr-2 h-4 w-4" />
            Security
          </TabsTrigger>
        </TabsList>

        <TabsContent value="account">
          <Card>
            <CardHeader>
              <CardTitle>Account Information</CardTitle>
              <CardDescription>
                View and update your account details
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-1">
                <h3 className="text-sm font-medium text-muted-foreground">
                  Name
                </h3>
                <p className="text-base">
                  {profile?.first_name} {profile?.last_name}
                </p>
              </div>
              <div className="space-y-1">
                <h3 className="text-sm font-medium text-muted-foreground">
                  Email
                </h3>
                <p className="text-base">{profile?.email}</p>
              </div>
              <div className="space-y-1">
                <h3 className="text-sm font-medium text-muted-foreground">
                  Role
                </h3>
                <p className="text-base capitalize">{profile?.role}</p>
              </div>
              <div className="pt-4">
                <Button variant="outline">Edit Profile</Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {isAdmin && (
          <TabsContent value="user">
            <Card>
              <CardHeader>
                <CardTitle>User Management</CardTitle>
                <CardDescription>
                  Manage user accounts for the Legal Aid system
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <p>
                  As an administrator, you can create and manage user accounts
                  for agents and accountants.
                </p>
                <div className="flex flex-col space-y-2">
                  <Button asChild>
                    <Link to="/admin/users">
                      <UserPlus className="mr-2 h-4 w-4" />
                      Manage Users
                    </Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        )}

        <TabsContent value="security">
          <Card>
            <CardHeader>
              <CardTitle>Security Settings</CardTitle>
              <CardDescription>
                Manage your account security settings
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="space-y-1">
                  <h3 className="text-sm font-medium text-muted-foreground">
                    Password
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    Last updated: Never
                  </p>
                </div>
                <Button variant="outline">
                  <Lock className="mr-2 h-4 w-4" />
                  Change Password
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
