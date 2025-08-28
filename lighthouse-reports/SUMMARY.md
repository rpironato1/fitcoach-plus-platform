# Lighthouse CI Testing Summary Report

## Overview

- **Total Pages Tested**: 4
- **Failed Tests**: 0
- **Test Date**: Thu Aug 28 10:36:18 UTC 2025
- **Test Environment**: Development Server (localhost:8030)

## Average Scores

- **Accessibility**: 97/100
- **Performance**: 99/100

## Individual Page Results

### not-found

- **URL**: http://localhost:8030/non-existent-page
- **Accessibility**: 100/100
- **Performance**: 100/100
- **Report**: [HTML](html/not-found.report.html) | [JSON](json/not-found.report.json)

### localStorage-manager

- **URL**: http://localhost:8030/localStorage-manager
- **Accessibility**: 100/100
- **Performance**: 100/100
- **Report**: [HTML](html/localStorage-manager.report.html) | [JSON](json/localStorage-manager.report.json)

### landing-page

- **URL**: http://localhost:8030/
- **Accessibility**: 96/100
- **Performance**: 99/100
- **Report**: [HTML](html/landing-page.report.html) | [JSON](json/landing-page.report.json)

### student-demo

- **URL**: http://localhost:8030/student-demo
- **Accessibility**: 95/100
- **Performance**: 99/100
- **Report**: [HTML](html/student-demo.report.html) | [JSON](json/student-demo.report.json)

## Critical Accessibility Issues Found

### landing-page

- **color-contrast**: Background and foreground colors do not have a sufficient contrast ratio. (Low-contrast text is difficult or impossible for many users to read. [Learn how to provide sufficient color contrast](https://dequeuniversity.com/rules/axe/4.10/color-contrast).)

### student-demo

- **color-contrast**: Background and foreground colors do not have a sufficient contrast ratio. (Low-contrast text is difficult or impossible for many users to read. [Learn how to provide sufficient color contrast](https://dequeuniversity.com/rules/axe/4.10/color-contrast).)
