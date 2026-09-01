
interface FormDividerProps {
  text?: string;
}

export function FormDivider({ text = 'or' }: FormDividerProps) {
  return (
    <div className="my-6 flex items-center">
      <div className="flex-1 border-t border-gray-700"></div>
      <span className="px-4 text-sm text-gray-500">{text}</span>
      <div className="flex-1 border-t border-gray-700"></div>
    </div>
  );
};

