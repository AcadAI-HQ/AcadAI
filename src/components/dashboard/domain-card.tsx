import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { LucideIcon } from "lucide-react";
import { motion } from "framer-motion";

interface DomainCardProps {
  domain: {
    name: string;
    icon: LucideIcon;
    active: boolean;
  };
  onSelect: () => void;
}

export function DomainCard({ domain, onSelect }: DomainCardProps) {
  const Icon = domain.icon;

  return (
    <motion.div
      whileHover={{ y: -5 }}
      transition={{ type: "spring", stiffness: 300 }}
    >
      <Card
        onClick={domain.active ? onSelect : undefined}
        className={`h-full flex flex-col justify-between transition-all duration-300 ${
          domain.active
            ? "cursor-pointer hover:border-primary hover:shadow-lg"
            : "cursor-not-allowed bg-muted/50"
        }`}
      >
        <CardHeader>
          <div className="flex justify-between items-start">
            <Icon className="h-10 w-10 text-primary mb-4" />
            {!domain.active && (
              <Badge variant="secondary">Coming Soon</Badge>
            )}
          </div>
          <CardTitle className="font-headline">{domain.name}</CardTitle>
        </CardHeader>
        <CardContent>
          <CardDescription>
            {domain.active
              ? `Generate a personalized roadmap for ${domain.name} development.`
              : `The roadmap for ${domain.name} is currently under development.`}
          </CardDescription>
        </CardContent>
      </Card>
    </motion.div>
  );
}
