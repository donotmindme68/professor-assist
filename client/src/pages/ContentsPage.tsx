import {getUser} from "@/utils";
import {Navigate} from "react-router-dom";
import React from "react";
import SubscriberContentViewPage from "@/pages/SubscriberContentViewPage.tsx";
import ContentDetailsPage from "@/pages/ContentDetailsPage.tsx";

export function ContentsPage() {
  const user = getUser();


  if (!user) {
    return <Navigate to="/auth" replace/>;
  }
  if (user.role === 'content-creator')
    return <ContentDetailsPage/>

  else return <SubscriberContentViewPage/>
}