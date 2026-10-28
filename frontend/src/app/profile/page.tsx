"use client"

import * as React from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { User, Mail, Shield, UserCircle } from "lucide-react"

export default function ProfilePage() {
  return (
    <div className="container max-w-2xl py-12 space-y-8">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold text-dark-blue dark:text-gold flex items-center gap-2">
          <UserCircle className="h-8 w-8" />
          User Profile
        </h1>
        <p className="text-muted-foreground">Manage your personal information and security settings.</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Personal Information</CardTitle>
          <CardDescription>Update your contact and identification details.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="firstName">First Name</Label>
              <Input id="firstName" placeholder="Nishanth" disabled />
            </div>
            <div className="space-y-2">
              <Label htmlFor="lastName">Last Name</Label>
              <Input id="lastName" placeholder="JD" disabled />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="email">Email Address</Label>
            <div className="flex gap-2">
              <Input id="email" placeholder="nishanth@example.com" disabled className="flex-1" />
              <Button variant="outline" size="sm">Verify</Button>
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="phone">Phone Number</Label>
            <Input id="phone" placeholder="+91 99999 00000" disabled />
          </div>
        </CardContent>
        <CardFooter className="bg-muted/50 p-4 text-xs italic text-muted-foreground flex items-center gap-2">
          <Shield className="h-3 w-3" />
          This information is encrypted and only used for legal identification purposes.
        </CardFooter>
      </Card>

      <Card className="border-destructive/20 bg-destructive/5">
        <CardHeader>
          <CardTitle className="text-destructive">Danger Zone</CardTitle>
          <CardDescription>Irreversible account actions.</CardDescription>
        </CardHeader>
        <CardContent>
          <Button variant="destructive" size="sm">Delete Account</Button>
        </CardContent>
      </Card>
    </div>
  )
}
