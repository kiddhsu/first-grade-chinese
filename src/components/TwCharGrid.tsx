/** 與國語田字格同款十字線框，一字一格 */
export function TwCharGrid({ text }: { text: string }) {
  const chars = Array.from(text)

  return (
    <div className="tw-tianzi-row" aria-label={text}>
      {chars.map((ch, i) => (
        <div key={`${ch}-${i}`} className="tw-tianzi">
          <span>{ch}</span>
        </div>
      ))}
    </div>
  )
}
