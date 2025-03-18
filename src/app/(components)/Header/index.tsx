type HeaderProps = {
  name: string;
  className?: string; // Make className optional
};

const Header = ({ name, className  }: HeaderProps) => {
  return (
    <h1 className={`text-2xl font-semibold text-gray-700 dark:text ${className}`}>
      {name}
    </h1>
  );
};

export default Header;
