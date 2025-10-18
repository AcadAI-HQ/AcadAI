import AnimatedFooter from "@/components/ui/animated-footer";

const Footer = () => {
  const socialLinks = [
    { href: "https://x.com/acadaiwizard", label: "Twitter" },
    { href: "#", label: "LinkedIn" },
  ];
  const otherLinks = [
    { href: "#", label: "Home" },
    { href: "#", label: "About" },
    { href: "#", label: "Contact" },
  ];
  const copyrightText = "© 2025 Acad AI. All rights reserved.";

  return (
    <footer className="w-full">
      {/* Other footer content */}
      <AnimatedFooter
        socialLinks={socialLinks}
        otherLinks={otherLinks}
        copyrightText={copyrightText}
        barCount={23}
      />
    </footer>
  );
};

export default Footer;
