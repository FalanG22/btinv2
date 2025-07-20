import LoginForm from "./login-form";
import { Truck } from "lucide-react";

export default function LoginPage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-muted/40 p-4">
      <div className="w-full max-w-sm">
         <div className="flex flex-col items-center justify-center gap-4 mb-8">
            <div className="group flex h-14 w-14 shrink-0 items-center justify-center gap-2 rounded-full bg-primary text-lg font-semibold text-primary-foreground md:h-12 md:w-12 md:text-base">
                <Truck className="h-6 w-6 transition-all group-hover:scale-110" />
                <span className="sr-only">ZoneScan</span>
            </div>
            <h1 className="text-3xl font-bold">ZoneScan</h1>
            <p className="text-muted-foreground">Bienvenido. Por favor, inicia sesión.</p>
        </div>
        <LoginForm />
      </div>
    </main>
  );
}
