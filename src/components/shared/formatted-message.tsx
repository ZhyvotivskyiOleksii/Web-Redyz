
'use client';

import React from 'react';

export const FormattedMessage = ({ text }: { text: string }) => {
    if (!text) return null;

    const renderLine = (line: string) => {
        const boldRegex = /\*\*(.*?)\*\*/g;
        const parts = line.split(boldRegex);

        return parts.map((part, i) => {
            if (i % 2 === 1) {
                return <strong key={i}>{part}</strong>;
            }
            return part;
        });
    };

    const lines = text.split('\n');
    const isList = lines.some(line => line.trim().startsWith('* '));

    if (isList) {
        const listItems = lines.map(line => line.trim()).filter(line => line.startsWith('* '));
        const otherLines = lines.filter(line => !line.trim().startsWith('* '));
        
        return (
            <div className="space-y-2">
                {otherLines.map((line, index) => (
                     <p key={`p-${index}`} className="whitespace-pre-wrap">{renderLine(line)}</p>
                ))}
                <ul className="space-y-1 list-disc list-inside pl-2">
                    {listItems.map((item, index) => (
                        <li key={`li-${index}`} className="whitespace-pre-wrap">
                            {renderLine(item.substring(2))}
                        </li>
                    ))}
                </ul>
            </div>
        );
    }
    
    return <div className="whitespace-pre-wrap">{renderLine(text)}</div>;
};
