import React from 'react';

interface TabsProps {
  children: React.ReactNode;
  defaultValue?: string;
  value?: string;
  onValueChange?: (value: string) => void;
}

interface TabsListProps {
  children: React.ReactNode;
}

interface TabsTriggerProps {
  children: React.ReactNode;
  value: string;
}

interface TabsContentProps {
  children: React.ReactNode;
  value: string;
}

export const Tabs: React.FC<TabsProps> = ({ children }) => {
  return <div>{children}</div>;
};

export const TabsList: React.FC<TabsListProps> = ({ children }) => {
  return <div className="flex space-x-1">{children}</div>;
};

export const TabsTrigger: React.FC<TabsTriggerProps> = ({ children }) => {
  return <button>{children}</button>;
};

export const TabsContent: React.FC<TabsContentProps> = ({ children }) => {
  return <div>{children}</div>;
};