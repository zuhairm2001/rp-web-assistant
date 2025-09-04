"use client";

import { useWebSocketChat } from "@/lib/hooks/useWebSocketChat";
import { Conversation } from "@/components/ai-elements/conversation";
import {
  PromptInput,
  PromptInputTextarea,
  PromptInputSubmit,
  PromptInputToolbar,
} from "@/components/ai-elements/prompt-input";
import {
  Tool,
  ToolHeader,
  ToolContent,
  ToolInput,
  ToolOutput,
} from "@/components/ai-elements/tool";
import { Response } from "@/components/ai-elements/response";
import { Loader } from "@/components/ai-elements/loader";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  AlertCircle,
  Wifi,
  WifiOff,
  MessageSquare,
  Sparkles,
} from "lucide-react";

export default function ChatPage() {
  const {
    messages,
    isConnected,
    isConnecting,
    error,
    sendMessage,
    clearMessages,
    reconnect,

    isStreaming,
  } = useWebSocketChat({
    url: "ws://localhost:3001/api/ws",
  });

  const connectionStatus = isConnecting
    ? "connecting"
    : isConnected
      ? "connected"
      : "disconnected";

  return (
    <div className="flex flex-col h-screen bg-white">
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-3 border-b border-gray-200 bg-white">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#F5A623] to-[#f59323] flex items-center justify-center">
              <MessageSquare className="w-5 h-5 text-white" />
            </div>
            <h1 className="text-lg font-semibold text-gray-900">
              RP Assistant
            </h1>
          </div>
          <Badge
            variant={isConnected ? "outline" : "destructive"}
            className={`text-xs ${
              isConnected
                ? "border-green-300 bg-green-50 text-green-700"
                : "border-red-300 bg-red-50 text-red-700"
            }`}
          >
            <span className="flex items-center gap-1">
              {isConnected ? (
                <Wifi className="w-3 h-3" />
              ) : (
                <WifiOff className="w-3 h-3" />
              )}
              {connectionStatus}
            </span>
          </Badge>
        </div>

        <div className="flex items-center gap-2">
          {!isConnected && (
            <Button
              onClick={reconnect}
              variant="outline"
              size="sm"
              className="border-[#F5A623] text-[#F5A623] hover:bg-[#F5A623]/10"
            >
              Reconnect
            </Button>
          )}
          <Button
            onClick={clearMessages}
            variant="ghost"
            size="sm"
            className="text-gray-600 hover:text-gray-900 hover:bg-gray-100"
          >
            Clear Chat
          </Button>
        </div>
      </div>

      {/* Error Display */}
      {error && (
        <div className="mx-6 mt-4">
          <Card className="p-3 bg-red-50 border-red-200">
            <div className="flex items-center gap-2 text-red-700">
              <AlertCircle className="w-4 h-4" />
              <span className="text-sm">{error}</span>
            </div>
          </Card>
        </div>
      )}

      {/* Chat Container */}
      <div className="flex-1 flex flex-col min-h-0 bg-white">
        <Conversation className="flex-1 overflow-y-auto">
          <div className="max-w-3xl mx-auto px-4 py-8">
            {messages.length === 0 && !isStreaming && (
              <div className="flex flex-col items-center justify-center min-h-[400px] text-center">
                <div className="mb-6 w-16 h-16 rounded-full bg-gradient-to-br from-[#F5A623]/20 to-[#f59323]/20 flex items-center justify-center">
                  <Sparkles className="w-8 h-8 text-[#F5A623]" />
                </div>
                <h2 className="text-2xl font-semibold text-gray-900 mb-2">
                  Welcome to RP Assistant
                </h2>
                <p className="text-gray-600 max-w-md">
                  I&apos;m here to help you with products, weather information,
                  and more. How can I assist you today?
                </p>
                <div className="mt-6 flex flex-wrap gap-2 justify-center">
                  <button
                    onClick={() => sendMessage("What products are available?")}
                    className="px-3 py-1.5 text-sm bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                  >
                    Browse products
                  </button>
                  <button
                    onClick={() => sendMessage("What's the weather today?")}
                    className="px-3 py-1.5 text-sm bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                  >
                    Check weather
                  </button>
                  <button
                    onClick={() => sendMessage("Tell me about your services")}
                    className="px-3 py-1.5 text-sm bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                  >
                    Learn about services
                  </button>
                </div>
              </div>
            )}

            {messages.map((message) => (
              <div key={message.id} className="mb-4">
                {message.role === "user" ? (
                  <div className="flex justify-end mb-4">
                    <div className="max-w-[70%] px-4 py-2 bg-[#F5A623] text-white rounded-2xl shadow-sm">
                      <div className="whitespace-pre-wrap break-words">
                        {message.content}
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="flex justify-start mb-4">
                    <div className="flex gap-3 max-w-[85%]">
                      <div className="flex-shrink-0 w-7 h-7 rounded-full bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center">
                        <MessageSquare className="w-4 h-4 text-gray-600" />
                      </div>
                      <div className="flex-grow min-w-0">
                        <div
                          className={`inline-block px-4 py-2 bg-gray-100 rounded-2xl ${
                            isStreaming &&
                            messages[messages.length - 1]?.id === message.id
                              ? "min-w-[20px]"
                              : ""
                          }`}
                        >
                          <Response
                            content={message.content}
                            isStreaming={
                              isStreaming &&
                              messages[messages.length - 1]?.id === message.id
                            }
                            className="prose prose-gray max-w-none text-gray-900 [&>p]:mb-2 [&>p:last-child]:mb-0"
                          />
                          {isStreaming &&
                            messages[messages.length - 1]?.id === message.id &&
                            !message.content && (
                              <div className="w-2 h-4 bg-gray-400 rounded animate-pulse"></div>
                            )}
                        </div>

                        {/* Tool Calls */}
                        {message.toolCalls &&
                          message.toolCalls.map((toolCall) => (
                            <div key={toolCall.id} className="mt-2">
                              <Tool className="bg-gray-50 border border-gray-200 text-gray-700">
                                <ToolHeader
                                  type={`tool-${toolCall.name}` as const}
                                  state={
                                    toolCall.status === "completed"
                                      ? "output-available"
                                      : toolCall.status === "error"
                                        ? "output-error"
                                        : "input-available"
                                  }
                                />
                                <ToolContent>
                                  {toolCall.input && (
                                    <ToolInput input={toolCall.input} />
                                  )}
                                  {(toolCall.output ||
                                    toolCall.status === "error") && (
                                    <ToolOutput
                                      output={
                                        toolCall.output
                                          ? JSON.stringify(
                                              toolCall.output,
                                              null,
                                              2,
                                            )
                                          : undefined
                                      }
                                      errorText={
                                        toolCall.status === "error"
                                          ? "Tool execution failed"
                                          : undefined
                                      }
                                    />
                                  )}
                                </ToolContent>
                              </Tool>
                            </div>
                          ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ))}

            {/* Streaming Indicator */}
            {isStreaming && messages.length === 0 && (
              <div className="flex justify-start mb-4">
                <div className="flex gap-3">
                  <div className="flex-shrink-0 w-7 h-7 rounded-full bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center">
                    <MessageSquare className="w-4 h-4 text-gray-600" />
                  </div>
                  <div className="px-4 py-2 bg-gray-100 rounded-2xl">
                    <Loader size="sm" className="text-gray-500" />
                  </div>
                </div>
              </div>
            )}
          </div>
        </Conversation>

        {/* Input Area */}
        <div className="border-t border-gray-200 bg-white">
          <div className="max-w-3xl mx-auto p-4">
            <PromptInput
              onSubmit={(e) => {
                e.preventDefault();
                const formData = new FormData(e.currentTarget);
                const message = formData.get("message") as string;
                if (message?.trim() && isConnected) {
                  sendMessage(message.trim());
                  e.currentTarget.reset();
                }
              }}
              className="bg-white border-gray-300 rounded-2xl shadow-sm focus-within:border-[#F5A623] focus-within:ring-2 focus-within:ring-[#F5A623]/20 transition-all"
            >
              <PromptInputTextarea
                placeholder={
                  isConnected
                    ? "Message RP Assistant..."
                    : "Connect to start chatting..."
                }
                disabled={!isConnected || isStreaming}
                className="text-gray-900 placeholder-gray-500 resize-none border-0 focus:ring-0"
                name="message"
              />
              <PromptInputToolbar className="border-t-0">
                <div className="flex items-center gap-2 text-xs text-gray-500">
                  {isStreaming && (
                    <span className="flex items-center gap-1">
                      <Loader size="sm" />
                      Generating...
                    </span>
                  )}
                </div>
                <PromptInputSubmit
                  disabled={!isConnected || isStreaming}
                  className="bg-[#F5A623] text-white hover:bg-[#F5A623]/90 rounded-lg px-3 py-1.5 text-sm font-medium"
                />
              </PromptInputToolbar>
            </PromptInput>

            {!isConnected && (
              <div className="flex items-center justify-center mt-3">
                <div className="text-sm text-gray-500 flex items-center gap-2">
                  <AlertCircle className="w-4 h-4" />
                  Not connected to chat service
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
