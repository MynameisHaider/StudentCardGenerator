"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { 
  CreditCard, 
  Upload, 
  FileSpreadsheet, 
  Palette, 
  Printer, 
  Shield, 
  Zap,
  CheckCircle,
  ArrowRight,
  Menu,
  X,
  Smartphone,
  Users,
  Star
} from "lucide-react"
import Link from "next/link"

export default function LandingPage() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  const features = [
    {
      icon: FileSpreadsheet,
      title: "Smart Excel Import",
      description: "Upload your student data via Excel with automatic validation. Missing names and invalid blood groups are highlighted instantly."
    },
    {
      icon: Upload,
      title: "ZIP Photo Upload",
      description: "Upload all student photos in one ZIP file. Photos are automatically matched with roll numbers (101.jpg → Roll No 101)."
    },
    {
      icon: Palette,
      title: "Customizable Templates",
      description: "Choose from Simple or Advanced templates. Customize colors to match your school branding."
    },
    {
      icon: CreditCard,
      title: "Credit-Based System",
      description: "Pay only for what you use. 10 PKR per card. 5 free credits on signup to get started."
    },
    {
      icon: Printer,
      title: "A4 Print Ready",
      description: "Generate professional A4 PDFs with 8-10 cards per page. Perfect for duplex printing."
    },
    {
      icon: Smartphone,
      title: "PWA Enabled",
      description: "Install on any device - PC, laptop, or mobile. Works like a native app with offline support."
    }
  ]

  const pricingPlans = [
    {
      name: "Free Trial",
      price: "5 Cards",
      description: "Get started with 5 free credits",
      features: ["5 Free ID Cards", "Basic Templates", "Excel Import", "ZIP Photo Upload"],
      popular: false
    },
    {
      name: "Standard",
      price: "10 PKR",
      perCard: true,
      description: "Pay per card generated",
      features: ["All Templates", "Custom Colors", "QR Code Integration", "Priority Support", "A4 Print Layouts"],
      popular: true
    },
    {
      name: "School Package",
      price: "Custom",
      description: "Bulk pricing for large schools",
      features: ["Volume Discounts", "Dedicated Support", "Custom Templates", "Training Session", "API Access"],
      popular: false
    }
  ]

  const steps = [
    {
      step: 1,
      title: "Download Template",
      description: "Download our Excel template and fill in student data"
    },
    {
      step: 2,
      title: "Upload Data",
      description: "Upload Excel file and ZIP of student photos"
    },
    {
      step: 3,
      title: "Preview Cards",
      description: "Review and customize your ID card design"
    },
    {
      step: 4,
      title: "Generate PDF",
      description: "Download print-ready A4 PDF with all cards"
    }
  ]

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b">
        <nav className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-lg flex items-center justify-center">
              <CreditCard className="w-6 h-6 text-white" />
            </div>
            <span className="text-xl font-bold text-slate-800">SmartCard</span>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-8">
            <a href="#features" className="text-slate-600 hover:text-emerald-600 transition">Features</a>
            <a href="#how-it-works" className="text-slate-600 hover:text-emerald-600 transition">How It Works</a>
            <a href="#pricing" className="text-slate-600 hover:text-emerald-600 transition">Pricing</a>
            <Link href="/auth/signin">
              <Button variant="outline" className="mr-2">Sign In</Button>
            </Link>
            <Link href="/auth/signin">
              <Button className="bg-emerald-600 hover:bg-emerald-700">Get Started</Button>
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <button 
            className="md:hidden p-2"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </nav>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden bg-white border-t py-4 px-4 space-y-4">
            <a href="#features" className="block text-slate-600 hover:text-emerald-600">Features</a>
            <a href="#how-it-works" className="block text-slate-600 hover:text-emerald-600">How It Works</a>
            <a href="#pricing" className="block text-slate-600 hover:text-emerald-600">Pricing</a>
            <div className="pt-2 space-y-2">
              <Link href="/auth/signin" className="block">
                <Button variant="outline" className="w-full">Sign In</Button>
              </Link>
              <Link href="/auth/signin" className="block">
                <Button className="w-full bg-emerald-600 hover:bg-emerald-700">Get Started</Button>
              </Link>
            </div>
          </div>
        )}
      </header>

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-16 md:py-24">
        <div className="max-w-4xl mx-auto text-center">
          <Badge variant="secondary" className="mb-4 bg-emerald-100 text-emerald-700">
            <Zap className="w-3 h-3 mr-1" />
            Pakistan&apos;s #1 Student ID Card Generator
          </Badge>
          <h1 className="text-4xl md:text-6xl font-bold text-slate-900 mb-6 leading-tight">
            Professional Student ID Cards
            <span className="text-emerald-600"> in Minutes</span>
          </h1>
          <p className="text-lg md:text-xl text-slate-600 mb-8 max-w-2xl mx-auto">
            Transform your Excel data and student photos into print-ready ID cards. 
            Simple, fast, and affordable at just PKR 10 per card.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/auth/signin">
              <Button size="lg" className="bg-emerald-600 hover:bg-emerald-700 text-lg px-8">
                Start Generating Cards
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
            </Link>
            <a href="#how-it-works">
              <Button size="lg" variant="outline" className="text-lg px-8">
                See How It Works
              </Button>
            </a>
          </div>
          
          {/* Stats */}
          <div className="grid grid-cols-3 gap-4 mt-12 max-w-2xl mx-auto">
            <div className="text-center">
              <div className="text-3xl font-bold text-emerald-600">500+</div>
              <div className="text-sm text-slate-500">Schools</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-emerald-600">50K+</div>
              <div className="text-sm text-slate-500">Cards Generated</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-emerald-600">4.9★</div>
              <div className="text-sm text-slate-500">User Rating</div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="bg-slate-50 py-16 md:py-24">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">
              Everything You Need
            </h2>
            <p className="text-lg text-slate-600 max-w-2xl mx-auto">
              Powerful features designed specifically for Pakistani schools
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
            {features.map((feature, index) => (
              <Card key={index} className="border-0 shadow-lg hover:shadow-xl transition-shadow">
                <CardHeader>
                  <div className="w-12 h-12 bg-emerald-100 rounded-lg flex items-center justify-center mb-4">
                    <feature.icon className="w-6 h-6 text-emerald-600" />
                  </div>
                  <CardTitle className="text-xl">{feature.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-slate-600">
                    {feature.description}
                  </CardDescription>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="py-16 md:py-24">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">
              How It Works
            </h2>
            <p className="text-lg text-slate-600">
              Generate ID cards in 4 simple steps
            </p>
          </div>
          
          <div className="max-w-4xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              {steps.map((step, index) => (
                <div key={index} className="relative">
                  <div className="bg-white rounded-xl p-6 shadow-lg border text-center">
                    <div className="w-10 h-10 bg-emerald-600 text-white rounded-full flex items-center justify-center text-xl font-bold mx-auto mb-4">
                      {step.step}
                    </div>
                    <h3 className="font-semibold text-slate-900 mb-2">{step.title}</h3>
                    <p className="text-sm text-slate-600">{step.description}</p>
                  </div>
                  {index < steps.length - 1 && (
                    <div className="hidden md:block absolute top-1/2 -right-3 transform -translate-y-1/2">
                      <ArrowRight className="w-6 h-6 text-emerald-300" />
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="bg-slate-50 py-16 md:py-24">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">
              Simple, Transparent Pricing
            </h2>
            <p className="text-lg text-slate-600">
              Pay only for what you use
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {pricingPlans.map((plan, index) => (
              <Card 
                key={index} 
                className={`relative ${plan.popular ? 'border-emerald-500 border-2 shadow-xl' : 'border shadow-lg'}`}
              >
                {plan.popular && (
                  <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                    <Badge className="bg-emerald-600">Most Popular</Badge>
                  </div>
                )}
                <CardHeader className="text-center pb-2">
                  <CardTitle className="text-xl">{plan.name}</CardTitle>
                  <div className="mt-4">
                    <span className="text-4xl font-bold text-slate-900">{plan.price}</span>
                    {plan.perCard && <span className="text-slate-500">/card</span>}
                  </div>
                  <CardDescription>{plan.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-3">
                    {plan.features.map((feature, i) => (
                      <li key={i} className="flex items-center gap-2 text-sm text-slate-600">
                        <CheckCircle className="w-4 h-4 text-emerald-500 flex-shrink-0" />
                        {feature}
                      </li>
                    ))}
                  </ul>
                  <Link href="/auth/signin" className="block mt-6">
                    <Button 
                      className={`w-full ${plan.popular ? 'bg-emerald-600 hover:bg-emerald-700' : ''}`}
                      variant={plan.popular ? 'default' : 'outline'}
                    >
                      Get Started
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 md:py-24 bg-gradient-to-r from-emerald-600 to-teal-600">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            Ready to Create Professional ID Cards?
          </h2>
          <p className="text-lg text-emerald-100 mb-8 max-w-2xl mx-auto">
            Join 500+ schools across Pakistan. Get 5 free credits on signup.
          </p>
          <Link href="/auth/signin">
            <Button size="lg" variant="secondary" className="text-lg px-8 bg-white text-emerald-600 hover:bg-emerald-50">
              Start Free Trial
              <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-900 text-slate-400 py-12">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 bg-emerald-600 rounded-lg flex items-center justify-center">
                  <CreditCard className="w-4 h-4 text-white" />
                </div>
                <span className="text-lg font-bold text-white">SmartCard</span>
              </div>
              <p className="text-sm">
                Professional Student ID Card Generator for Pakistani Schools
              </p>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-4">Product</h4>
              <ul className="space-y-2 text-sm">
                <li><a href="#features" className="hover:text-emerald-400 transition">Features</a></li>
                <li><a href="#pricing" className="hover:text-emerald-400 transition">Pricing</a></li>
                <li><a href="#" className="hover:text-emerald-400 transition">Templates</a></li>
              </ul>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-4">Support</h4>
              <ul className="space-y-2 text-sm">
                <li><a href="#" className="hover:text-emerald-400 transition">Help Center</a></li>
                <li><a href="#" className="hover:text-emerald-400 transition">Contact Us</a></li>
                <li><a href="#" className="hover:text-emerald-400 transition">FAQ</a></li>
              </ul>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-4">Legal</h4>
              <ul className="space-y-2 text-sm">
                <li><a href="#" className="hover:text-emerald-400 transition">Privacy Policy</a></li>
                <li><a href="#" className="hover:text-emerald-400 transition">Terms of Service</a></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-slate-800 mt-8 pt-8 text-center text-sm">
            <p>&copy; 2024 SmartCard. All rights reserved. Made with ❤️ in Pakistan</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
