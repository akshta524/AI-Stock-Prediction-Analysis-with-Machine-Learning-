import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { TrendingUp, Lock, User as UserIcon } from 'lucide-react';
import { motion } from 'motion/react';

interface LoginProps {
  onLogin: (username: string) => void;
}

export const Login: React.FC<LoginProps> = ({ onLogin }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Hardcoded credentials as requested
    if (username === 'akshta suresh chavan' && password === '123456') {
      onLogin(username);
    } else {
      setError('Invalid credentials. Please check your username and password.');
    }
  };

  return (
    <div className="min-h-screen bg-[#0e1117] text-white flex items-center justify-center relative overflow-hidden p-6">
      <div className="visual-decor opacity-30"></div>
      
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md z-10"
      >
        <div className="flex flex-col items-center mb-10">
          <div className="w-16 h-16 bg-[#00d4aa] rounded-2xl flex items-center justify-center shadow-[0_0_30px_rgba(0,212,170,0.4)] mb-6">
            <TrendingUp className="text-[#0e1117] w-8 h-8 font-bold" />
          </div>
          <h1 className="text-3xl font-bold tracking-tight text-[#00d4aa]">StockPro Analytics</h1>
          <p className="text-[#94a3b8] mt-2">Institutional Grade Market Intelligence</p>
        </div>

        <Card className="bg-[#1e2130] border-[#334155] shadow-2xl rounded-3xl overflow-hidden">
          <CardHeader className="p-8 pb-4">
            <CardTitle className="text-xl">Welcome Back</CardTitle>
            <CardDescription className="text-[#94a3b8]">Enter your credentials to access the terminal</CardDescription>
          </CardHeader>
          <CardContent className="p-8 pt-4">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <label className="text-xs font-bold text-[#94a3b8] uppercase tracking-wider">Username</label>
                <div className="relative">
                  <UserIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#94a3b8]" />
                  <Input
                    type="text"
                    placeholder="akshta suresh chavan"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="pl-10 bg-[#0e1117] border-[#334155] focus-visible:ring-[#00d4aa] h-12 rounded-xl"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-[#94a3b8] uppercase tracking-wider">Password</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#94a3b8]" />
                  <Input
                    type="password"
                    placeholder="••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="pl-10 bg-[#0e1117] border-[#334155] focus-visible:ring-[#00d4aa] h-12 rounded-xl"
                    required
                  />
                </div>
              </div>

              {error && (
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="text-rose-400 text-xs font-medium text-center"
                >
                  {error}
                </motion.p>
              )}

              <Button
                type="submit"
                className="w-full bg-[#00d4aa] hover:bg-[#00b894] text-[#0e1117] font-bold h-12 rounded-xl text-lg shadow-lg shadow-[#00d4aa]/10"
              >
                Access Terminal
              </Button>
            </form>
          </CardContent>
        </Card>

        <div className="mt-8 text-center">
          <p className="text-[10px] text-[#94a3b8] uppercase tracking-[2px] font-bold">
            Secure Enterprise Gateway v4.2.0
          </p>
        </div>
      </motion.div>
    </div>
  );
};
