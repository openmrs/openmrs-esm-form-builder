import React from 'react';
import ReactMde from 'react-mde';
import ReactMarkdown from 'react-markdown';
import styles from './markdown-question.scss';

interface MarkdownQuestionProps {
  placeholder?: string;
  onValueChange: (value: string) => void;
}

const MarkdownQuestion: React.FC<MarkdownQuestionProps> = ({ placeholder, onValueChange }) => {
  const [value, setValue] = React.useState(placeholder || "");
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
        toolbarCommands={[
          ["bold", "italic"]
        ]}
        generateMarkdownPreview={(markdown) =>
          Promise.resolve(
            <ReactMarkdown
              children={Array.isArray(markdown) ? markdown.join('\n') : markdown}
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