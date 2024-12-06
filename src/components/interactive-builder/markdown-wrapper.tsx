import React from "react";
import ReactMarkdown from 'react-markdown';

const MarkdownWrapper: React.FC<{ markdown: string | Array<string> }> = ({ markdown }) => {
  const delimiters = ['***', '**', '*', '__', '_'];

  function shortenMarkdownText(markdown: string | Array<string>, limit: number, delimiters: Array<string>) {
    const inputString = Array.isArray(markdown) ? markdown.join('\n') : markdown;
    let truncatedContent = inputString.length <= limit ? inputString : inputString.slice(0, limit).trimEnd();
    const delimiterPattern = /[*_#]+$/;
    if (delimiterPattern.test(truncatedContent)) {
      truncatedContent = truncatedContent.replace(delimiterPattern, '').trimEnd();
    }
    let mutableString = truncatedContent
    const unmatchedDelimiters = [];
    
    for (const delimiter of delimiters) {
        const firstIndex = mutableString.indexOf(delimiter);
        const secondIndex = mutableString.indexOf(delimiter, firstIndex + delimiter.length);
        if (firstIndex !== -1) {
            if (secondIndex === -1) {
                unmatchedDelimiters.push(delimiter);
                mutableString = mutableString.replace(delimiter, '');
            } else {
                mutableString = mutableString.replace(delimiter, '').replace(delimiter, '');
            }
        }
    }
    return truncatedContent + unmatchedDelimiters.reverse().join('') + (inputString.length > limit ? ' ...' : '');
  }

  const shortMarkdownText = shortenMarkdownText(markdown, 15, delimiters);

  return (
    <ReactMarkdown
      children={shortMarkdownText}
      unwrapDisallowed={true}
      allowedElements={['h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'p', 'strong', 'em']}
    />
  );
};

export default MarkdownWrapper;