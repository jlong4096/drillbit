import * as React from 'react';
import { useInView } from 'react-intersection-observer';

// Credit:  https://tuffstuff9.hashnode.dev/intuitive-scrolling-for-chatbot-message-streaming

interface ChatScrollAnchorProps {
    trackVisibility: boolean;
    isAtBottom: boolean;
    scrollAreaRef: React.RefObject<HTMLDivElement | null>;
}

function ChatScrollAnchor({
    trackVisibility,
    isAtBottom,
    scrollAreaRef,
}: ChatScrollAnchorProps) {
    const { ref, inView, entry } = useInView({
        trackVisibility,
        delay: 100,
    });

    React.useEffect(() => {
        if (isAtBottom && trackVisibility && !inView) {
            if (!scrollAreaRef.current) return;

            const scrollAreaElement = scrollAreaRef.current;

            scrollAreaElement.scrollTop =
                scrollAreaElement.scrollHeight - scrollAreaElement.clientHeight;
        }
    }, [inView, entry, isAtBottom, trackVisibility]);

    return <div ref={ref} className='h-px w-full' />;
}


export default ChatScrollAnchor;
