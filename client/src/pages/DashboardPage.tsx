import React from 'react';
import {Navigate} from 'react-router-dom';
import {getUser} from '@/utils';
import ContentCreatorDashboardPage from "@/pages/ContentCreatorDashboardPage.tsx";
import SubscriberDashboardPage from "@/pages/SubscriberDashboardPage.tsx";

export default function DashboardPage() {
  const user = getUser();


  if (!user) {
    return <Navigate to="/auth" replace/>;
  }
  if (user.role === 'content-creator')
    return <ContentCreatorDashboardPage/>

  else return <SubscriberDashboardPage/>
}