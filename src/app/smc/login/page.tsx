'use client';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth, useFirestore } from "@/firebase";
import { initiateEmailSignIn } from "@/firebase/non-blocking-login";
import { setDocumentNonBlocking } from "@/firebase/non-blocking-updates";
import { doc } from "firebase/firestore";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { useUser } from "@/firebase";

export default function SmcLoginPage() {
  const auth = useAuth();
  const firestore = useFirestore();
  const router = useRouter();
  const { user } = useUser();

  const handleDemoLogin = () => {
    if (!auth) return;
    initiateEmailSignIn(auth, 'officer@smc.gov.in', 'password123');
  }

  useEffect(() => {
    if (user && firestore) {
      if (user.email === 'officer@smc.gov.in') {
        const userDocRef = doc(firestore, 'users', user.uid);
        setDocumentNonBlocking(userDocRef, {
          id: user.uid,
          email: user.email,
          name: 'PMC Admin Demo',
          role: 'official',
          points: 0,
        }, { merge: true });
        router.push('/smc/dashboard');
      }
    }
  }, [user, firestore, router]);


  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100 dark:bg-gray-900">
      <Card className="w-full max-w-sm">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold">PMC Admin Login</CardTitle>
          <CardDescription>Enter your credentials to access the command center.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" placeholder="officer@smc.gov.in" required />
            </div>
            <div className="space-y-2">
              <div className="flex items-center">
                <Label htmlFor="password">Password</Label>
                <Link href="#" className="ml-auto inline-block text-sm underline" prefetch={false}>
                  Forgot your password?
                </Link>
              </div>
              <Input id="password" type="password" required />
            </div>
            <Button type="submit" className="w-full">
              Login
            </Button>
             <Button variant="outline" className="w-full" onClick={handleDemoLogin}>
              Demo Login
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
