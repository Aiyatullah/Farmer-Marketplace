import { ArrowRight, ShoppingCart, LayoutDashboard } from "lucide-react";
import { Button } from "@/components/ui/button";
import { auth } from "@/../lib/auth";
import { headers } from "next/headers";

export default async function HomePage() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });
  
  const userRole = session?.user?.role || '';

  return (
    <div className="relative flex min-h-screen flex-col bg-background">

      <div className="flex-1">
        {/* Hero Section */}
        <section className="relative flex items-center justify-center py-20 md:py-32 overflow-hidden">
          {/* Background Image with overlay */}
          <div className="absolute inset-0 z-0">
            <div 
              className="absolute inset-0 bg-cover bg-center"
              style={{
                backgroundImage: "url('https://images.unsplash.com/photo-1473187983301-4c013a707159?q=80&w=2070&auto=format&fit=crop')",
              }}
            />
            <div className="absolute inset-0 bg-black/60" />
            <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent" />
          </div>

          {/* Content */}
          <div className="container relative z-10 px-4 mx-auto text-center">
            <div className="inline-flex items-center px-4 py-2 mb-6 text-sm font-medium text-green-100 bg-green-900/30 rounded-full border border-green-800/50 backdrop-blur-sm">
              <span className="relative flex h-2 w-2 mr-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
              </span>
              Fresh from the Farm, Directly to You
            </div>

            <h1 className="mb-6 text-4xl font-bold tracking-tight text-white sm:text-5xl md:text-6xl lg:text-7xl">
              Welcome to{' '}
              <span className="bg-gradient-to-r from-green-300 via-green-400 to-green-500 bg-clip-text text-transparent">
                FarmConnect
              </span>
            </h1>

            <p className="mx-auto mb-10 max-w-2xl text-lg text-gray-300 md:text-xl">
              Discover the best local produce, artisanal goods, and connect with
              growers in your community. Freshness is just a click away.
            </p>

            <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
              {session?.user ? (
                <>
                  <Button 
                    asChild 
                    size="lg" 
                  >
                    <a href={userRole === 'FARMER' ? '/dashboard/farmer' : '/dashboard/customer'}>
                      <LayoutDashboard className="mr-2 h-5 w-5" />
                      Go to Dashboard
                    </a>
                  </Button>
                  <Button 
                    asChild 
                    variant="outline" 
                    size="lg" 
                    className="h-14 px-8 text-base border-white/20 bg-white/5 hover:bg-white/10"
                  >
                    <a href="/market">
                      <ShoppingCart className="mr-2 h-5 w-5" />
                      Browse Market
                    </a>
                  </Button>
                </>
              ) : (
                <>
                  <Button 
                    asChild 
                    size="lg" 
                    className="h-14 px-8 text-base bg-green-600 hover:bg-green-700"
                  >
                    <a href="/login">
                      Get Started
                      <ArrowRight className="ml-2 h-5 w-5" />
                    </a>
                  </Button>
                  <Button 
                    asChild 
                    variant="outline" 
                    size="lg" 
                    className="h-14 px-8 text-base border-white/20 bg-white/5 hover:bg-white/10"
                  >
                    <a href="/market">
                      Explore Market
                    </a>
                  </Button>
                </>
              )}
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="py-20 bg-background">
          <div className="container px-4 mx-auto">
            <div className="max-w-3xl mx-auto text-center mb-16">
              <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
                Fresh, Local, and Sustainable
              </h2>
              <p className="mt-4 text-lg text-muted-foreground">
                Connect directly with local farmers and producers in your community.
              </p>
            </div>

            <div className="grid gap-8 md:grid-cols-3">
              {[
                {
                  name: 'Farm Fresh',
                  description: 'Get the freshest produce straight from local farms to your table.',
                  icon: '🌱',
                },
                {
                  name: 'Support Local',
                  description: 'Help sustain local agriculture and small businesses in your community.',
                  icon: '🤝',
                },
                {
                  name: 'Easy Ordering',
                  description: 'Simple and convenient way to order your favorite local products.',
                  icon: '🛒',
                },
              ].map((feature, index) => (
                <div key={index} className="p-6 rounded-xl border bg-card text-card-foreground shadow-sm">
                  <div className="text-4xl mb-4">{feature.icon}</div>
                  <h3 className="text-xl font-semibold mb-2">{feature.name}</h3>
                  <p className="text-muted-foreground">{feature.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      </div>

      <footer className="border-t py-6 md:py-8">
        <div className="container px-4 mx-auto">
          <div className="flex flex-col items-center justify-between md:flex-row">
            <div className="mb-4 md:mb-0">
              <span className="font-bold text-lg bg-gradient-to-r from-green-600 to-green-400 bg-clip-text text-transparent">
                FarmConnect
              </span>
            </div>
            <p className="text-sm text-muted-foreground">
              © {new Date().getFullYear()} FarmConnect. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
