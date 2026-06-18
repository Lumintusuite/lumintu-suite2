export function H1({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <h1 className={`text-4xl font-bold tracking-tight text-foreground sm:text-5xl ${className}`}>
      {children}
    </h1>
  );
}

export function H2({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <h2 className={`text-3xl font-semibold tracking-tight text-foreground sm:text-4xl ${className}`}>
      {children}
    </h2>
  );
}

export function H3({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <h3 className={`text-2xl font-semibold tracking-tight text-foreground sm:text-3xl ${className}`}>
      {children}
    </h3>
  );
}

export function H4({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <h4 className={`text-xl font-semibold tracking-tight text-foreground ${className}`}>
      {children}
    </h4>
  );
}

export function Lead({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <p className={`text-lg text-muted-foreground ${className}`}>
      {children}
    </p>
  );
}

export function Body({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <p className={`text-base text-foreground ${className}`}>
      {children}
    </p>
  );
}

export function Small({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <p className={`text-sm text-muted-foreground ${className}`}>
      {children}
    </p>
  );
}

export function Muted({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <p className={`text-sm text-muted-foreground ${className}`}>
      {children}
    </p>
  );
}
