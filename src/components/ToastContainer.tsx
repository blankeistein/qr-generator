import { Toast } from '../hooks/useToast';

const icons: Record<string, string> = {
  info: '💬',
  success: '✅',
  error: '❌',
  loading: '⏳',
};

const colors: Record<string, string> = {
  info: 'bg-white text-black',
  success: 'bg-brutal-green text-black',
  error: 'bg-brutal-red text-white',
  loading: 'bg-brutal-yellow text-black',
};

interface Props {
  toasts: Toast[];
}

export default function ToastContainer({ toasts }: Props) {
  return (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2 pointer-events-none">
      {toasts.map((t) => (
        <div
          key={t.id}
          className={`
            px-4 py-3 text-sm font-bold pointer-events-auto
            border-[3px] border-brutal-black dark:border-brutal-white
            shadow-brutal font-mono
            ${colors[t.type] || colors.info}
            animate-slide-in
          `}
          style={{ animation: 'slideInRight 0.2s ease forwards' }}
        >
          <span className="mr-2">{icons[t.type]}</span>
          {t.msg}
        </div>
      ))}
    </div>
  );
}
