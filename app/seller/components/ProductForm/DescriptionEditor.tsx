'use client';

import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Underline from '@tiptap/extension-underline';
import Image from '@tiptap/extension-image';
import TextAlign from '@tiptap/extension-text-align';
import { TextStyle } from '@tiptap/extension-text-style';
import { useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import {
  Bold,
  Italic,
  Underline as UnderlineIcon,
  AlignLeft,
  AlignCenter,
  AlignRight,
  List,
  ListOrdered,
  ImageIcon,
} from 'lucide-react';
import { DescriptionEditorProps } from '@/types/seller/product';

export default function DescriptionEditor({ data, onChange }: DescriptionEditorProps) {
  const imageInputRef = useRef<HTMLInputElement>(null);

  const editor = useEditor({
    extensions: [
      StarterKit,
      Underline,
      Image.configure({ inline: false }),
      TextAlign.configure({ types: ['heading', 'paragraph'] }),
      TextStyle.extend({
        addAttributes() {
          return {
            ...this.parent?.(),
            fontSize: {
              default: null,
              parseHTML: (element) => element.style.fontSize || null,
              renderHTML: (attributes) => {
                if (!attributes.fontSize) return {};
                return { style: `font-size: ${attributes.fontSize}` };
              },
            },
          };
        },
      }),
    ],
    content: data.content,
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
    editorProps: {
      attributes: {
        class:
          'min-h-[280px] px-4 py-3 text-sm text-gray-800 focus:outline-none prose prose-sm max-w-none',
      },
    },
  });

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !editor) return;
    if (file.size > 5 * 1024 * 1024) {
      alert('이미지는 5MB 이하만 업로드할 수 있어요.');
      return;
    }
    const url = URL.createObjectURL(file);
    editor.chain().focus().setImage({ src: url }).run();
    e.target.value = '';
  };

  if (!editor) return null;

  const toolbarButtons = [
    {
      icon: <Bold size={14} />,
      action: () => editor.chain().focus().toggleBold().run(),
      isActive: editor.isActive('bold'),
      title: '굵게',
    },
    {
      icon: <Italic size={14} />,
      action: () => editor.chain().focus().toggleItalic().run(),
      isActive: editor.isActive('italic'),
      title: '기울임',
    },
    {
      icon: <UnderlineIcon size={14} />,
      action: () => editor.chain().focus().toggleUnderline().run(),
      isActive: editor.isActive('underline'),
      title: '밑줄',
    },
    { type: 'divider' },
    {
      icon: <AlignLeft size={14} />,
      action: () => editor.chain().focus().setTextAlign('left').run(),
      isActive: editor.isActive({ textAlign: 'left' }),
      title: '왼쪽 정렬',
    },
    {
      icon: <AlignCenter size={14} />,
      action: () => editor.chain().focus().setTextAlign('center').run(),
      isActive: editor.isActive({ textAlign: 'center' }),
      title: '가운데 정렬',
    },
    {
      icon: <AlignRight size={14} />,
      action: () => editor.chain().focus().setTextAlign('right').run(),
      isActive: editor.isActive({ textAlign: 'right' }),
      title: '오른쪽 정렬',
    },
    { type: 'divider' },
    {
      icon: <List size={14} />,
      action: () => editor.chain().focus().toggleBulletList().run(),
      isActive: editor.isActive('bulletList'),
      title: '글머리 기호',
    },
    {
      icon: <ListOrdered size={14} />,
      action: () => editor.chain().focus().toggleOrderedList().run(),
      isActive: editor.isActive('orderedList'),
      title: '번호 목록',
    },
    { type: 'divider' },
    {
      icon: <ImageIcon size={14} />,
      action: () => imageInputRef.current?.click(),
      isActive: false,
      title: '이미지 삽입',
    },
  ];

  return (
    <Card>
      <CardHeader className="border-b">
        <CardTitle>상품 설명</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-4 pt-5">
        <div className="border border-gray-200 rounded-md overflow-hidden">
          {/* 툴바 */}
          <div className="flex items-center gap-0.5 px-2 py-1.5 border-b border-gray-200 bg-gray-50 flex-wrap">
            {/* 폰트 사이즈 셀렉터 */}
            <select
              onChange={(e) =>
                editor.chain().focus().setMark('textStyle', { fontSize: e.target.value }).run()
              }
              className="text-sm border border-gray-200 rounded px-1 py-0.5 text-gray-600 mr-1"
              defaultValue=""
            >
              <option value="" disabled>
                크기
              </option>
              <option value="12px">12</option>
              <option value="14px">14</option>
              <option value="16px">16</option>
              <option value="18px">18</option>
              <option value="24px">24</option>
              <option value="32px">32</option>
            </select>

            <Separator orientation="vertical" className="h-4 mx-1" />

            {toolbarButtons.map((btn, i) =>
              btn.type === 'divider' ? (
                <Separator key={i} orientation="vertical" className="h-4 mx-1" />
              ) : (
                <Button
                  key={i}
                  type="button"
                  title={btn.title}
                  onClick={btn.action}
                  variant={btn.isActive ? 'default' : 'ghost'}
                  size="icon-sm"
                >
                  {btn.icon}
                </Button>
              )
            )}
          </div>

          {/* 에디터 */}
          <EditorContent editor={editor} />
        </div>

        <input
          ref={imageInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={handleImageUpload}
        />

        <p className="text-xs text-gray-400">
          블로그처럼 글을 작성하세요. 제목, 본문, 이미지를 자유롭게 배치하여 풍부한 상품 설명을 만들
          수 있어요.
        </p>
      </CardContent>
    </Card>
  );
}
