interface DiaryEntryProps {
  content: string
}

export default function DiaryEntry({ content }: DiaryEntryProps) {
  return <div className="handwriting text-xl leading-relaxed whitespace-pre-wrap">{content}</div>
}
