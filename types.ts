import React from 'react';

export interface Tool {
  id: string;
  name: string;
  description: string;
  // FIX: Changed React.ReactNode to React.ReactElement to be more specific and solve type errors when cloning the element to add a className.
  // FIX: Specified <any> for React.ReactElement to allow passing props like className during cloning.
  icon: React.ReactElement<any>;
  component: React.FC;
  category?: string;
}
