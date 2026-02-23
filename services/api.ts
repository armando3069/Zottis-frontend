"use client";

import { getSocket } from "@/lib/socket";

// helper generic pentru request/response prin socket.io
function requestResponse<T>(
    emitEvent: string,
    payload: any,
    successEvent: string,
    errorEvent = "error"
): Promise<T> {
    const socket = getSocket();

    return new Promise((resolve, reject) => {
        const handleSuccess = (data: T) => {
            socket.off(successEvent, handleSuccess);
            socket.off(errorEvent, handleError);
            resolve(data);
        };

        const handleError = (err: any) => {
            socket.off(successEvent, handleSuccess);
            socket.off(errorEvent, handleError);
            reject(err);
        };

        socket.once(successEvent, handleSuccess);
        socket.once(errorEvent, handleError);

        socket.emit(emitEvent, payload);
    });
}

export function getConversations(): Promise<any[]> {
    return requestResponse<any[]>(
        "getConversations",
        undefined,
        "conversations"
    );
}

export function getMessages(conversationId: number): Promise<any[]> {
    return requestResponse<any[]>(
        "getMessages",
        { conversationId },
        "messages"
    );
}

export function sendReply(
    conversationId: number,
    text: string
): Promise<{ success: boolean }> {
    return requestResponse<{ success: boolean }>(
        "sendReply",
        { conversationId, text },
        "replySent"
    );
}

// abonări la evenimente realtime
export function subscribeToNewMessage(handler: (message: any) => void) {
    const socket = getSocket();
    socket.on("newMessage", handler);
    return () => socket.off("newMessage", handler);
}

export function subscribeToNewConversation(handler: (conversation: any) => void) {
    const socket = getSocket();
    socket.on("newConversation", handler);
    return () => socket.off("newConversation", handler);
}