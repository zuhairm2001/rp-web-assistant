'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { MessageCircle, ShoppingCart, Cloud, Zap, Globe, Calendar, ArrowRight, Sparkles, Bot } from 'lucide-react';

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-gray-50">
      {/* Hero Section */}
      <div className="container mx-auto px-4 py-20">
        <div className="text-center max-w-4xl mx-auto">
          {/* Logo/Icon */}
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-gradient-to-br from-[#F5A623] to-[#f59323] mb-8 shadow-lg">
            <Bot className="w-10 h-10 text-white" />
          </div>
          
          <h1 className="text-6xl font-bold mb-6 bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
            RP Web Assistant
          </h1>
          <p className="text-xl text-gray-600 mb-10 leading-relaxed max-w-2xl mx-auto">
            Experience intelligent conversations powered by advanced AI. 
            Get instant help with products, weather, and more through natural dialogue.
          </p>
          
          <div className="flex gap-4 justify-center">
            <Link href="/chat">
              <Button 
                size="lg" 
                className="bg-[#F5A623] text-white hover:bg-[#F5A623]/90 text-lg px-8 py-6 rounded-xl shadow-lg hover:shadow-xl transition-all"
              >
                <MessageCircle className="w-5 h-5 mr-2" />
                Start Chatting
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
            </Link>
          </div>

          {/* Trust badges */}
          <div className="mt-12 flex flex-wrap justify-center gap-6 text-sm text-gray-500">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              <span>Live & Ready</span>
            </div>
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-[#F5A623]" />
              <span>AI-Powered</span>
            </div>
            <div className="flex items-center gap-2">
              <Zap className="w-4 h-4 text-[#F5A623]" />
              <span>Real-time Responses</span>
            </div>
          </div>
        </div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mt-20 max-w-6xl mx-auto">
          <Card className="p-6 bg-white border-gray-200 hover:border-[#F5A623]/30 hover:shadow-lg transition-all group">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-3 bg-gradient-to-br from-[#F5A623]/10 to-[#F5A623]/5 rounded-xl group-hover:from-[#F5A623]/20 group-hover:to-[#F5A623]/10 transition-colors">
                <ShoppingCart className="w-6 h-6 text-[#F5A623]" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900">Product Lookup</h3>
            </div>
            <p className="text-gray-600 leading-relaxed">
              Search and explore WooCommerce products with intelligent recommendations and detailed information.
            </p>
          </Card>

          <Card className="p-6 bg-white border-gray-200 hover:border-[#F5A623]/30 hover:shadow-lg transition-all group">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-3 bg-gradient-to-br from-[#F5A623]/10 to-[#F5A623]/5 rounded-xl group-hover:from-[#F5A623]/20 group-hover:to-[#F5A623]/10 transition-colors">
                <Cloud className="w-6 h-6 text-[#F5A623]" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900">Weather Updates</h3>
            </div>
            <p className="text-gray-600 leading-relaxed">
              Get real-time weather information for any location with detailed forecasts and conditions.
            </p>
          </Card>

          <Card className="p-6 bg-white border-gray-200 hover:border-[#F5A623]/30 hover:shadow-lg transition-all group">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-3 bg-gradient-to-br from-[#F5A623]/10 to-[#F5A623]/5 rounded-xl group-hover:from-[#F5A623]/20 group-hover:to-[#F5A623]/10 transition-colors">
                <Zap className="w-6 h-6 text-[#F5A623]" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900">AI-Powered</h3>
            </div>
            <p className="text-gray-600 leading-relaxed">
              Powered by advanced language models with streaming responses and intelligent tool usage.
            </p>
          </Card>

          <Card className="p-6 bg-gradient-to-br from-gray-50 to-white border-gray-200 hover:border-[#F5A623]/30 hover:shadow-lg transition-all group relative overflow-hidden">
            <div className="absolute top-2 right-2">
              <span className="text-xs bg-[#F5A623]/10 text-[#F5A623] px-2 py-1 rounded-full font-medium">Coming Soon</span>
            </div>
            <div className="flex items-center gap-3 mb-4">
              <div className="p-3 bg-gradient-to-br from-gray-200/50 to-gray-100/50 rounded-xl">
                <Globe className="w-6 h-6 text-gray-400" />
              </div>
              <h3 className="text-lg font-semibold text-gray-700">Vector Search</h3>
            </div>
            <p className="text-gray-500 text-sm leading-relaxed">
              Semantic search through service documentation and knowledge base.
            </p>
          </Card>

          <Card className="p-6 bg-gradient-to-br from-gray-50 to-white border-gray-200 hover:border-[#F5A623]/30 hover:shadow-lg transition-all group relative overflow-hidden">
            <div className="absolute top-2 right-2">
              <span className="text-xs bg-[#F5A623]/10 text-[#F5A623] px-2 py-1 rounded-full font-medium">Coming Soon</span>
            </div>
            <div className="flex items-center gap-3 mb-4">
              <div className="p-3 bg-gradient-to-br from-gray-200/50 to-gray-100/50 rounded-xl">
                <Calendar className="w-6 h-6 text-gray-400" />
              </div>
              <h3 className="text-lg font-semibold text-gray-700">Calendar Booking</h3>
            </div>
            <p className="text-gray-500 text-sm leading-relaxed">
              Schedule appointments and manage bookings through natural conversation.
            </p>
          </Card>

          <Card className="p-6 bg-gradient-to-br from-gray-50 to-white border-gray-200 hover:border-[#F5A623]/30 hover:shadow-lg transition-all group relative overflow-hidden">
            <div className="absolute top-2 right-2">
              <span className="text-xs bg-[#F5A623]/10 text-[#F5A623] px-2 py-1 rounded-full font-medium">Coming Soon</span>
            </div>
            <div className="flex items-center gap-3 mb-4">
              <div className="p-3 bg-gradient-to-br from-gray-200/50 to-gray-100/50 rounded-xl">
                <MessageCircle className="w-6 h-6 text-gray-400" />
              </div>
              <h3 className="text-lg font-semibold text-gray-700">Human Handoff</h3>
            </div>
            <p className="text-gray-500 text-sm leading-relaxed">
              Seamless transition to human support when needed.
            </p>
          </Card>
        </div>

        {/* CTA Section */}
        <div className="text-center mt-20 py-12 px-6 bg-gradient-to-r from-[#F5A623]/5 to-[#f59323]/5 rounded-3xl max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold mb-4 text-gray-900">Ready to experience the future?</h2>
          <p className="text-gray-600 mb-8 max-w-2xl mx-auto">
            Join thousands of users already benefiting from AI-powered assistance. 
            No setup required – just start chatting!
          </p>
          
          <Link href="/chat">
            <Button 
              size="lg"
              variant="outline" 
              className="border-[#F5A623] text-[#F5A623] hover:bg-[#F5A623] hover:text-white transition-all rounded-xl"
            >
              Launch Assistant
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </Link>
          
          <div className="flex flex-wrap justify-center gap-6 mt-8 text-sm text-gray-600">
            <span className="flex items-center gap-2">
              <div className="w-4 h-4 rounded-full bg-gradient-to-r from-[#F5A623] to-[#f59323]"></div>
              Real-time streaming
            </span>
            <span className="flex items-center gap-2">
              <div className="w-4 h-4 rounded-full bg-gradient-to-r from-[#F5A623] to-[#f59323]"></div>
              Tool integration
            </span>
            <span className="flex items-center gap-2">
              <div className="w-4 h-4 rounded-full bg-gradient-to-r from-[#F5A623] to-[#f59323]"></div>
              Natural language
            </span>
            <span className="flex items-center gap-2">
              <div className="w-4 h-4 rounded-full bg-gradient-to-r from-[#F5A623] to-[#f59323]"></div>
              Always improving
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}