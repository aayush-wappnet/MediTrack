interface FormErrorProps {
  error?: string | null;
}

function FormError({ error }: FormErrorProps) {
  if (!error) return null;
  return <p className="text-red-600 text-sm mb-4">{error}</p>;
}

export default FormError;