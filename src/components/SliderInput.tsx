interface Props {
  label: string;
  value: number;
  min: number;
  max: number;
  unit?: string;
  onChange: (val: number) => void;
}

export default function SliderInput({
  label, value, min, max, unit = 'px', onChange
}: Props) {
  return (
    <div className="mb-4">
      <label className="text-[11px] font-bold uppercase tracking-widest font-mono block mb-1.5 text-brutal-black dark:text-brutal-white">
        {label}
      </label>
      <div className="flex gap-2 items-center">
        <input
          type="range"
          min={min}
          max={max}
          value={value}
          onChange={(e) => onChange(Number(e.target.value))}
          className="flex-1 accent-brutal-black dark:accent-brutal-white h-1.5 cursor-pointer"
        />
        <div className="flex items-center gap-1">
          <input
            type="number"
            min={min}
            max={max}
            value={value}
            onChange={(e) =>
              onChange(Math.min(max, Math.max(min, Number(e.target.value))))
            }
            className="
              w-14 text-xs font-bold font-mono
              border-[2px] border-brutal-black dark:border-brutal-white
              px-1.5 py-1 text-center
              bg-white dark:bg-brutal-black
              text-brutal-black dark:text-brutal-white
              outline-none focus:ring-0
            "
          />
          <span className="text-xs font-mono text-gray-500 dark:text-gray-400">{unit}</span>
        </div>
      </div>
    </div>
  );
}
