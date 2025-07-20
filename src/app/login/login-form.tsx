"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useFormStatus } from "react-dom";
import { useActionState, useEffect } from "react";
import { login } from "@/lib/actions";

import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const loginSchema = z.object({
  email: z.string().email({ message: "Por favor, introduce un correo electrónico válido." }),
  password: z.string().min(1, { message: "La contraseña es obligatoria." }),
});

export default function LoginForm() {
    const [state, dispatch] = useActionState(login, undefined);
    const { toast } = useToast();

    const form = useForm<z.infer<typeof loginSchema>>({
        resolver: zodResolver(loginSchema),
        defaultValues: {
            email: "admin@sommiercenter.com",
            password: "password123",
        },
    });

    // Since this is a simplified login, we can show a toast if there was a (hypothetical) error.
    useEffect(() => {
        if (state?.error) {
            toast({
                variant: "destructive",
                title: "Error de Inicio de Sesión",
                description: state.error,
            });
        }
    }, [state, toast]);

    return (
        <Card>
            <CardContent className="pt-6">
                <Form {...form}>
                    <form action={dispatch} className="space-y-4">
                        <FormField
                            control={form.control}
                            name="email"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Email</FormLabel>
                                    <FormControl>
                                        <Input type="email" placeholder="john.doe@example.com" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="password"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Contraseña</FormLabel>
                                    <FormControl>
                                        <Input type="password" placeholder="••••••••" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <LoginButton />
                    </form>
                </Form>
            </CardContent>
        </Card>
    );
}

function LoginButton() {
    const { pending } = useFormStatus();
    return (
        <Button type="submit" className="w-full" disabled={pending}>
            {pending ? <Loader2 className="mr-2 animate-spin" /> : null}
            Iniciar Sesión
        </Button>
    );
}
