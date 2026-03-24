"use client"

import { useActionState } from "react"
import Link from "next/link"
import { loginAction } from "@/actions/auth"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { ArrowRight, Loader2 } from "lucide-react"

export default function LoginPage() {
  const [state, formAction, isPending] = useActionState(loginAction, undefined)

  return (
    <div className="grid min-h-screen lg:grid-cols-2">
      {/* Left — Decorative panel */}
      <div className="relative hidden lg:flex lg:flex-col lg:justify-between overflow-hidden bg-[#0c1222]">
        {/* Geometric grid pattern */}
        <div className="absolute inset-0" style={{ opacity: 0.06 }}>
          <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <pattern id="grid" width="60" height="60" patternUnits="userSpaceOnUse">
                <path d="M 60 0 L 0 0 0 60" fill="none" stroke="white" strokeWidth="0.5" />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#grid)" />
          </svg>
        </div>

        {/* Accent circles */}
        <div
          className="absolute top-[15%] left-[20%] w-72 h-72 rounded-full"
          style={{
            background: "radial-gradient(circle, rgba(37,99,235,0.15) 0%, transparent 70%)",
            animation: "float 8s ease-in-out infinite",
          }}
        />
        <div
          className="absolute bottom-[20%] right-[15%] w-96 h-96 rounded-full"
          style={{
            background: "radial-gradient(circle, rgba(37,99,235,0.1) 0%, transparent 70%)",
            animation: "float 10s ease-in-out infinite 2s",
          }}
        />

        {/* Content */}
        <div className="relative z-10 p-12">
          <div className="flex items-center gap-3">
            <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center">
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <rect x="1" y="1" width="6" height="6" rx="1.5" fill="white" />
                <rect x="9" y="1" width="6" height="6" rx="1.5" fill="white" opacity="0.5" />
                <rect x="1" y="9" width="6" height="6" rx="1.5" fill="white" opacity="0.5" />
                <rect x="9" y="9" width="6" height="6" rx="1.5" fill="white" opacity="0.3" />
              </svg>
            </div>
            <span className="text-white/90 text-sm font-medium tracking-wide">
              CoWork Hub
            </span>
          </div>
        </div>

        <div className="relative z-10 p-12">
          <blockquote className="space-y-4">
            <p className="text-[2rem] leading-[1.2] font-light text-white/90 tracking-tight max-w-md">
              Tu espacio de trabajo,
              <br />
              <span className="text-primary font-medium">siempre disponible.</span>
            </p>
            <p className="text-sm text-white/40 max-w-sm leading-relaxed">
              Reserva salas, puestos y cabinas al instante. Visualiza la
              disponibilidad y gestiona tu espacio sin fricciones.
            </p>
          </blockquote>
        </div>
      </div>

      {/* Right — Login form */}
      <div className="flex items-center justify-center p-8">
        <div className="mx-auto w-full max-w-[380px]">
          {/* Mobile logo */}
          <div className="mb-12 lg:hidden">
            <div className="flex items-center gap-3">
              <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center">
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                  <rect x="1" y="1" width="6" height="6" rx="1.5" fill="white" />
                  <rect x="9" y="1" width="6" height="6" rx="1.5" fill="white" opacity="0.5" />
                  <rect x="1" y="9" width="6" height="6" rx="1.5" fill="white" opacity="0.5" />
                  <rect x="9" y="9" width="6" height="6" rx="1.5" fill="white" opacity="0.3" />
                </svg>
              </div>
              <span className="text-foreground text-sm font-medium tracking-wide">
                CoWork Hub
              </span>
            </div>
          </div>

          <div
            className="space-y-2"
            style={{ animation: "slide-up 0.5s cubic-bezier(0.22, 1, 0.36, 1) forwards" }}
          >
            <h1 className="text-2xl font-semibold tracking-tight">
              Bienvenido
            </h1>
            <p className="text-sm text-muted-foreground">
              Introduce tus credenciales para acceder
            </p>
          </div>

          <form
            action={formAction}
            className="mt-8 space-y-5"
            style={{
              animation: "slide-up 0.5s cubic-bezier(0.22, 1, 0.36, 1) forwards",
              animationDelay: "80ms",
              opacity: 0,
            }}
          >
            {state?.error && (
              <div className="rounded-lg bg-destructive/8 border border-destructive/20 px-4 py-3 text-sm text-destructive">
                {state.error}
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="email" className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                Email
              </Label>
              <Input
                id="email"
                name="email"
                type="email"
                placeholder="tu@email.com"
                required
                autoComplete="email"
                className="h-11 bg-card border-border/60 transition-all duration-200 focus:border-primary/30 focus:bg-white placeholder:text-muted-foreground/50"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password" className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                Contrasena
              </Label>
              <Input
                id="password"
                name="password"
                type="password"
                placeholder="••••••••"
                required
                autoComplete="current-password"
                className="h-11 bg-card border-border/60 transition-all duration-200 focus:border-primary/30 focus:bg-white placeholder:text-muted-foreground/50"
              />
            </div>

            <Button
              type="submit"
              disabled={isPending}
              className="w-full h-11 text-sm font-medium transition-all duration-200 hover:shadow-md hover:shadow-primary/20"
            >
              {isPending ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Accediendo...
                </>
              ) : (
                <>
                  Iniciar sesion
                  <ArrowRight className="h-4 w-4" />
                </>
              )}
            </Button>
          </form>

          <p
            className="mt-8 text-center text-sm text-muted-foreground"
            style={{
              animation: "fade-in 0.5s cubic-bezier(0.22, 1, 0.36, 1) forwards",
              animationDelay: "200ms",
              opacity: 0,
            }}
          >
            No tienes cuenta?{" "}
            <Link
              href="/register"
              className="font-medium text-foreground hover:text-primary transition-colors underline underline-offset-4 decoration-border hover:decoration-primary"
            >
              Crear cuenta
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
