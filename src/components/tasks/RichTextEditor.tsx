import type { ComponentProps } from 'react';
import {
  BtnBold,
  BtnBulletList,
  BtnClearFormatting,
  BtnItalic,
  BtnNumberedList,
  BtnRedo,
  BtnUnderline,
  BtnUndo,
  Editor,
  EditorProvider,
  Toolbar,
} from 'react-simple-wysiwyg';
import { cn } from '@/lib/utils';
import { sanitizeRichText } from '@/lib/task-content';

type Props = {
  id: string;
  value: string;
  disabled?: boolean;
  placeholder?: string;
  minHeightClassName?: string;
  /** Caps total shell height; editor body scrolls so the toolbar stays visible. */
  maxHeightClassName?: string;
  onChange: (value: string) => void;
};

export function RichTextEditor({
  id,
  value,
  disabled = false,
  placeholder = 'Write here...',
  minHeightClassName = 'min-h-40',
  maxHeightClassName,
  onChange,
}: Props) {
  const handleChange: NonNullable<ComponentProps<typeof Editor>['onChange']> = (event) => {
    onChange(sanitizeRichText(event.target.value));
  };

  return (
    <EditorProvider>
      <Editor
        id={id}
        value={value}
        onChange={handleChange}
        disabled={disabled}
        placeholder={placeholder}
        className={cn(
          'rsw-task-editor prose prose-sm max-w-none px-3 py-3 text-sm text-foreground outline-none',
          'prose-p:my-2 prose-ul:my-2 prose-ol:my-2',
          'prose-a:text-primary prose-a:no-underline hover:prose-a:underline',
          maxHeightClassName
            ? 'min-h-0 flex-1 overflow-y-auto overflow-x-hidden wrap-anywhere'
            : minHeightClassName,
          disabled && 'cursor-not-allowed opacity-70',
        )}
        containerProps={{
          className: cn(
            'rsw-task-shell rounded-2xl border border-border bg-background',
            maxHeightClassName
              ? cn('min-h-0 flex flex-col overflow-hidden', maxHeightClassName)
              : 'overflow-hidden',
          ),
        }}
      >
        <Toolbar>
          <BtnUndo />
          <BtnRedo />
          <BtnBold />
          <BtnItalic />
          <BtnUnderline />
          <BtnBulletList />
          <BtnNumberedList />
          <BtnClearFormatting />
        </Toolbar>
      </Editor>
    </EditorProvider>
  );
}
