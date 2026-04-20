import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Check, Zap, Shield, BarChart3 } from "lucide-react";

export const EnterpriseModal: React.FC = () => {
  const handleUpgrade = async () => {
    try {
      const response = await fetch("/api/create-checkout-session", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      });
      const session = await response.json();
      if (session.url) {
        window.location.href = session.url;
      }
    } catch (error) {
      console.error("Upgrade error:", error);
    }
  };

  return (
    <Dialog>
      <DialogTrigger
        render={
          <Button className="bg-[#00d4aa] hover:bg-[#00b894] text-[#0e1117] font-bold shadow-[0_0_20px_rgba(0,212,170,0.2)] rounded-lg px-6">
            <Zap className="w-4 h-4 mr-2 fill-current" />
            Upgrade to Enterprise
          </Button>
        }
      />
      <DialogContent className="sm:max-w-[550px] bg-[#1e2130] border-[#334155] text-white p-0 overflow-hidden rounded-2xl shadow-2xl">
        <div className="visual-decor opacity-20"></div>
        <div className="p-10 space-y-8">
          <DialogHeader>
            <div className="premium-badge mb-4">ENTERPRISE LICENSE</div>
            <DialogTitle className="text-3xl font-bold leading-tight">Unlock Institutional Grade Insights</DialogTitle>
            <DialogDescription className="text-[#94a3b8] text-base pt-2">
              Join over 5,000+ traders using our sub-second latency data and portfolio automation suite.
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <FeatureItem 
              title="Unlimited Tickers"
              description="Track as many assets as you need without any rate limiting."
            />
            <FeatureItem 
              title="Sub-Second Refresh"
              description="Real-time data stream direct from exchange feeds."
            />
            <FeatureItem 
              title="AI Risk Management"
              description="Predictive volatility modelling based on order flow."
            />
            <FeatureItem 
              title="Priority API Access"
              description="Direct CSV/JSON export endpoints for backtesting."
            />
          </div>

          <div className="checkout-card mt-4">
            <div className="flex justify-between items-baseline border-b border-[#334155] pb-6">
              <span className="text-sm text-[#94a3b8] font-bold uppercase tracking-wider">Enterprise Annual</span>
              <div className="text-right">
                <span className="text-4xl font-bold">$499</span>
                <span className="text-[#94a3b8] text-sm ml-1">/year</span>
              </div>
            </div>
            
            <Button 
              onClick={handleUpgrade}
              className="w-full bg-[#00d4aa] hover:bg-[#00b894] text-[#0e1117] h-14 text-lg font-bold rounded-xl shadow-lg"
            >
              Complete Payment
            </Button>
            
            <div className="flex justify-center gap-6 opacity-50 text-[10px] font-bold uppercase tracking-[1px]">
              <span>🔒 SSL SECURE</span>
              <span>💳 PCI COMPLIANT</span>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

const FeatureItem = ({ title, description }: { title: string, description: string }) => (
  <div className="feature-item">
    <div className="check-icon">✓</div>
    <div>
      <h4 className="font-bold text-sm mb-1 text-white">{title}</h4>
      <p className="text-[12px] text-[#94a3b8] leading-relaxed">{description}</p>
    </div>
  </div>
);
