import React from 'react';
import {Redirect} from '@docusaurus/router';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';

export default function Home() {
  const {siteConfig} = useDocusaurusContext();
  return (
    <Redirect to={`${siteConfig.baseUrl}docs/category/projet-application-python`} />
  );
}

