import React from 'react';
import {Navigate} from 'react-router-dom';
import {getUser} from '@/utils';
import ContentCreatorDashboard from "@/components/creator/ContentCreatorDashboard.tsx";
import {ChatPage} from "@/pages/ChatPage.tsx";

export default function DashboardPage() {
  const user = getUser();


  if (!user) {
    return <Navigate to="/auth" replace/>;
  }
  if (user.role === 'content-creator')
    return <ContentCreatorDashboard/>

  else return <ChatPage/>
}