import type { HTMLAttributes, PointerEvent, PropsWithChildren } from 'react';

type Props = PropsWithChildren<HTMLAttributes<HTMLDivElement>>;

export default function SpotlightCard({ children, className = '', ...props }: Props) {
  const handlePointerMove = (event: PointerEvent<HTMLDivElement>) => {
    const rect = event.currentTarget.getBoundingClientRect();
    event.currentTarget.style.setProperty('--spot-x', `${event.clientX - rect.left}px`);
    event.currentTarget.style.setProperty('--spot-y', `${event.clientY - rect.top}px`);
  };

  return <div {...props} onPointerMove={handlePointerMove} className={`spotlight-surface ${className}`.trim()}>{children}</div>;
}
