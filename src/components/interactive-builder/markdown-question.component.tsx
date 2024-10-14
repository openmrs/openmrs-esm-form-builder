import React from 'react';
import ReactMde, { getDefaultToolbarCommands } from 'react-mde';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeRaw from 'rehype-raw';
import styles from './markdown-question.scss';

interface MarkdownQuestionProps {
  palceHolder?: string;
  onValueChange: (value: string) => void;
}

const MarkdownQuestion: React.FC<MarkdownQuestionProps> = ({ palceHolder, onValueChange }) => {
  const [value, setValue] = React.useState(palceHolder || "");
  const [selectedTab, setSelectedTab] = React.useState<"write" | "preview">("write");

  const handleEditorChange = (newValue: string) => {
    setValue(newValue);
    onValueChange(newValue);
  };

  const handleTabChange = () => {
    setSelectedTab((prevTab) => (prevTab === "write" ? "preview" : "write"));
  };

  return (
    <div className={styles.container}>
      <ReactMde
        value={value}
        onChange={handleEditorChange}
        selectedTab={selectedTab}
        onTabChange={handleTabChange}
        toolbarCommands={getDefaultToolbarCommands()}
        generateMarkdownPreview={(markdown) =>
          Promise.resolve(
            <ReactMarkdown
              children={Array.isArray(markdown) ? markdown.join('\n') : markdown}
              remarkPlugins={[remarkGfm]} // Adds support for GFM features
              rehypePlugins={[rehypeRaw]} // Allows HTML like <sub> and <sup>
            />
          )
        }
        childProps={{
          writeButton: {
            tabIndex: -1
          }
        }}
        loadingPreview='loading preview...'
      />
    </div>
  );
}

export default MarkdownQuestion;