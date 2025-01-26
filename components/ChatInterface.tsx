"use client";

import React, { useRef, useEffect, useState, KeyboardEvent } from "react";
import Markdown from "react-markdown";
import { ToolInvocation } from "ai";
import { useChat } from "ai/react";
import { Bot, User, Send } from "lucide-react";
import ChatScrollAnchor from "./ScrollAnchor";

interface ChatInterfaceProps {
  vendorId: string;
}

const ChatInterface = ({ vendorId }: ChatInterfaceProps) => {
  // CHAT HANDLERS
  const {
    append,
    addToolResult,
    messages,
    input,
    handleInputChange,
    handleSubmit,
    isLoading,
  } = useChat({
    api: `/api/chat/${vendorId}`,
    // maxSteps: 2,
    body: {
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    },
  });

  useEffect(() => {
    console.log(JSON.stringify(messages));
  }, [messages]);

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault(); // Prevent default newline
      handleSubmit(e);
    }
  };

  const conversationStarters = ["Today", "Tomorrow", "Services?"];
  const handleConversationStarter = (starter: string) => {
    append({
      role: "user",
      content: starter,
    });
  };

  // SCROLL HANDLERS
  const [isAtBottom, setIsAtBottom] = useState<boolean>(false);
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const formInputRef = useRef<HTMLTextAreaElement>(null);

  const handleScroll = () => {
    if (!scrollAreaRef.current) return;

    const { scrollTop, scrollHeight, clientHeight } = scrollAreaRef.current;
    const atBottom = scrollHeight - clientHeight <= scrollTop + 1;

    console.log(atBottom);
    setIsAtBottom(atBottom);
  };

  useEffect(() => {
    if (isLoading) {
      if (!scrollAreaRef.current) return;

      const scrollAreaElement = scrollAreaRef.current;

      scrollAreaElement.scrollTop =
        scrollAreaElement.scrollHeight - scrollAreaElement.clientHeight;

      setIsAtBottom(true);
    } else if (formInputRef.current) {
      // Restore focus to the input.
      formInputRef.current.focus();
    }
  }, [isLoading]);

  return (
    <div className="w-[50%] flex flex-col h-screen bg-gray-50">
      <div
        className="flex-grow overflow-y-auto py-4 px-4"
        ref={scrollAreaRef}
        onScroll={handleScroll}
      >
        {/* Chat Messages Container */}
        {messages.length === 0 && (
          <div className="h-full flex flex-col items-center justify-center transition-opacity duration-500 ease-out opacity-100">
            {/* Welcome message */}
            <div className="flex-grow flex items-center justify-center">
              <h1 className="text-5xl font-light text-gray-400 text-center max-w-xl mx-auto leading-tight select-none">
                How can I help you?
              </h1>
            </div>
            {/* Conversation starters */}
            <div className="flex justify-center space-x-2 pb-4">
              {conversationStarters.map((starter) => (
                <button
                  key={starter}
                  onClick={() => handleConversationStarter(starter)}
                  className="px-4 py-1 border border-gray-300 rounded-full text-gray-600 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-200 transition-colors duration-200"
                >
                  {starter}
                </button>
              ))}
            </div>
          </div>
        )}
        <div className="mx-auto space-y-4">
          {messages.map((message, index) => (
            <div
              key={index}
              className={"flex items-start space-x-3 justify-start"}
            >
              {/* Icon */}
              <div className="order-first">
                {message.role === "user" ? (
                  <User className="w-8 h-8 text-blue-500" />
                ) : (
                  <Bot className="w-8 h-8 text-green-500" />
                )}
              </div>

              {/* Message Bubble */}
              <div
                className={`
                  px-4 py-2 rounded-lg
                  ${
                    message.role === "user"
                      ? "bg-blue-100 text-blue-800"
                      : "bg-green-100 text-green-800"
                  }
                `}
              >
                <Markdown>{message.content}</Markdown>
                {message.toolInvocations?.length &&
                  message.toolInvocations.map((toolInvoke: ToolInvocation) => {
                    if (toolInvoke.toolName === "askForConfirmation") {
                      const addResult = (result: string) =>
                        addToolResult({
                          toolCallId: toolInvoke.toolCallId,
                          result,
                        });
                      return (
                        <div key={toolInvoke.toolCallId}>
                          {toolInvoke.args.message}
                          <div>
                            {"result" in toolInvoke ? (
                              <b>{toolInvoke.result}</b>
                            ) : (
                              <>
                                <button
                                  onClick={() => addResult("Yes")}
                                  className="px-4 py-1 bg-green-500 rounded-full text-white hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-200 transition-colors duration-200"
                                >
                                  Yes
                                </button>
                                <button
                                  onClick={() => addResult("No")}
                                  className="mx-4 px-4 py-1 bg-red-500 rounded-full text-white hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-200 transition-colors duration-200"
                                >
                                  No
                                </button>
                              </>
                            )}
                          </div>
                        </div>
                      );
                    }
                    return "result" in toolInvoke ? (
                      <Markdown key={toolInvoke.toolCallId}>
                        {toolInvoke.result.result}
                      </Markdown>
                    ) : (
                      <div key={toolInvoke.toolCallId} />
                    );
                  })}
              </div>
            </div>
          ))}
          <ChatScrollAnchor
            scrollAreaRef={scrollAreaRef}
            isAtBottom={isAtBottom}
            trackVisibility={isLoading}
          />
        </div>
      </div>

      {/* Input Area */}
      <div className="p-4 bg-white border-t">
        <form
          onSubmit={handleSubmit}
          className="max-w-2xl mx-auto flex items-center space-x-2"
        >
          <textarea
          ref={formInputRef}
            disabled={isLoading}
            value={input}
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
            placeholder="Type your message..."
            rows={3}
            className="text-gray-700 flex-grow p-2 border rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-blue-300"
          />
          <button
            disabled={isLoading}
            type="submit"
            className="
              p-2 rounded-full border-2 border-blue-500
              text-blue-500 hover:bg-blue-100
              focus:outline-none focus:ring-2 focus:ring-blue-300
              transition-colors duration-200
            "
          >
            <Send className="w-6 h-6" />
          </button>
        </form>
      </div>
    </div>
  );
};

export default ChatInterface;
