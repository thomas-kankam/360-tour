export default function Container({ children, className = "", as: Component = "div" }) {
  return (
    <Component className={`mx-auto w-full max-w-8xl px-4 sm:px-6 ${className}`.trim()}>
      {children}
    </Component>
  );
}
