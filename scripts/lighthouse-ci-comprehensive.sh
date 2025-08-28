#!/bin/bash

# Comprehensive Lighthouse CI Testing Script
# Tests all pages with accessibility focus and generates detailed reports

set -e

echo "🚀 Starting Comprehensive Lighthouse CI Testing..."

# Ensure the dev server is running
echo "📡 Checking if dev server is running..."
if ! curl -s http://localhost:8030 > /dev/null; then
    echo "❌ Dev server not running. Please start with 'npm run dev'"
    exit 1
fi

echo "✅ Dev server is running"

# Create directories for reports
mkdir -p lighthouse-reports
mkdir -p lighthouse-reports/screenshots
mkdir -p lighthouse-reports/json
mkdir -p lighthouse-reports/html

# Function to run lighthouse with retry logic
run_lighthouse() {
    local url=$1
    local name=$2
    local category=${3:-"accessibility,performance,best-practices,seo"}
    local max_retries=3
    local retry=0

    echo "🔍 Testing: $name ($url)"
    
    while [ $retry -lt $max_retries ]; do
        if npx lighthouse "$url" \
            --output=html \
            --output=json \
            --output-path="lighthouse-reports/${name}" \
            --chrome-flags="--headless --no-sandbox --disable-dev-shm-usage" \
            --only-categories="$category" \
            --preset=desktop \
            --throttling-method=devtools \
            --quiet; then
            
            echo "✅ Completed: $name"
            
            # Extract accessibility score
            local accessibility_score=$(jq -r '.categories.accessibility.score // 0' "lighthouse-reports/${name}.report.json" 2>/dev/null || echo "0")
            local performance_score=$(jq -r '.categories.performance.score // 0' "lighthouse-reports/${name}.report.json" 2>/dev/null || echo "0")
            
            # Convert to percentage
            accessibility_score=$(echo "$accessibility_score * 100" | bc -l | cut -d'.' -f1)
            performance_score=$(echo "$performance_score * 100" | bc -l | cut -d'.' -f1)
            
            echo "   📊 Accessibility: ${accessibility_score}/100"
            echo "   📊 Performance: ${performance_score}/100"
            
            # Move files to organized folders
            mv "lighthouse-reports/${name}.report.html" "lighthouse-reports/html/"
            mv "lighthouse-reports/${name}.report.json" "lighthouse-reports/json/"
            
            return 0
        else
            retry=$((retry + 1))
            echo "⚠️  Retry $retry/$max_retries for $name"
            sleep 2
        fi
    done
    
    echo "❌ Failed to test $name after $max_retries attempts"
    return 1
}

# Define pages to test (public pages only for now)
declare -A pages=(
    ["landing-page"]="http://localhost:8030/"
    ["student-demo"]="http://localhost:8030/student-demo"
    ["localStorage-manager"]="http://localhost:8030/localStorage-manager"
    ["not-found"]="http://localhost:8030/non-existent-page"
)

echo "📋 Testing ${#pages[@]} pages..."

# Test all pages
failed_tests=()
total_accessibility_score=0
total_performance_score=0
tested_pages=0

for name in "${!pages[@]}"; do
    url="${pages[$name]}"
    
    if run_lighthouse "$url" "$name" "accessibility,performance,best-practices,seo"; then
        tested_pages=$((tested_pages + 1))
        
        # Add to totals for average calculation
        if [ -f "lighthouse-reports/json/${name}.report.json" ]; then
            accessibility_score=$(jq -r '.categories.accessibility.score // 0' "lighthouse-reports/json/${name}.report.json" 2>/dev/null || echo "0")
            performance_score=$(jq -r '.categories.performance.score // 0' "lighthouse-reports/json/${name}.report.json" 2>/dev/null || echo "0")
            
            total_accessibility_score=$(echo "$total_accessibility_score + $accessibility_score" | bc -l)
            total_performance_score=$(echo "$total_performance_score + $performance_score" | bc -l)
        fi
    else
        failed_tests+=("$name")
    fi
    
    echo "---"
done

# Calculate averages
if [ $tested_pages -gt 0 ]; then
    avg_accessibility=$(echo "scale=2; ($total_accessibility_score / $tested_pages) * 100" | bc -l | cut -d'.' -f1)
    avg_performance=$(echo "scale=2; ($total_performance_score / $tested_pages) * 100" | bc -l | cut -d'.' -f1)
else
    avg_accessibility=0
    avg_performance=0
fi

# Generate summary report
cat > lighthouse-reports/SUMMARY.md << EOF
# Lighthouse CI Testing Summary Report

## Overview
- **Total Pages Tested**: $tested_pages
- **Failed Tests**: ${#failed_tests[@]}
- **Test Date**: $(date)
- **Test Environment**: Development Server (localhost:8030)

## Average Scores
- **Accessibility**: ${avg_accessibility}/100
- **Performance**: ${avg_performance}/100

## Individual Page Results

EOF

# Add individual results to summary
for name in "${!pages[@]}"; do
    if [ -f "lighthouse-reports/json/${name}.report.json" ]; then
        url="${pages[$name]}"
        accessibility_score=$(jq -r '.categories.accessibility.score // 0' "lighthouse-reports/json/${name}.report.json" 2>/dev/null || echo "0")
        performance_score=$(jq -r '.categories.performance.score // 0' "lighthouse-reports/json/${name}.report.json" 2>/dev/null || echo "0")
        
        accessibility_score=$(echo "$accessibility_score * 100" | bc -l | cut -d'.' -f1)
        performance_score=$(echo "$performance_score * 100" | bc -l | cut -d'.' -f1)
        
        cat >> lighthouse-reports/SUMMARY.md << EOF
### $name
- **URL**: $url
- **Accessibility**: ${accessibility_score}/100
- **Performance**: ${performance_score}/100
- **Report**: [HTML](html/${name}.report.html) | [JSON](json/${name}.report.json)

EOF
    fi
done

# Add failed tests section if any
if [ ${#failed_tests[@]} -gt 0 ]; then
    cat >> lighthouse-reports/SUMMARY.md << EOF
## Failed Tests
The following pages could not be tested:

EOF
    for failed in "${failed_tests[@]}"; do
        echo "- $failed" >> lighthouse-reports/SUMMARY.md
    done
fi

# Add accessibility issues section
cat >> lighthouse-reports/SUMMARY.md << EOF

## Critical Accessibility Issues Found

EOF

# Extract accessibility violations from all reports
for json_file in lighthouse-reports/json/*.report.json; do
    if [ -f "$json_file" ]; then
        page_name=$(basename "$json_file" .report.json)
        
        # Extract accessibility violations
        violations=$(jq -r '.audits | to_entries[] | select(.value.scoreDisplayMode == "binary" and .value.score == 0 and (.key | contains("color-contrast") or contains("heading") or contains("image-alt") or contains("link-name") or contains("button-name"))) | "- **\(.key)**: \(.value.title) (\(.value.description))"' "$json_file" 2>/dev/null || echo "")
        
        if [ -n "$violations" ]; then
            echo "### $page_name" >> lighthouse-reports/SUMMARY.md
            echo "$violations" >> lighthouse-reports/SUMMARY.md
            echo "" >> lighthouse-reports/SUMMARY.md
        fi
    fi
done

echo ""
echo "📊 LIGHTHOUSE CI TESTING COMPLETE"
echo "=================================="
echo "✅ Tested Pages: $tested_pages"
echo "❌ Failed Tests: ${#failed_tests[@]}"
echo "📈 Average Accessibility Score: ${avg_accessibility}/100"
echo "📈 Average Performance Score: ${avg_performance}/100"
echo ""
echo "📁 Reports saved to: lighthouse-reports/"
echo "📄 Summary report: lighthouse-reports/SUMMARY.md"
echo ""

# Check if accessibility threshold is met
if [ "$avg_accessibility" -lt 100 ]; then
    echo "⚠️  ACCESSIBILITY THRESHOLD NOT MET"
    echo "   Target: 100/100"
    echo "   Actual: ${avg_accessibility}/100"
    echo "   Needs improvement: $((100 - avg_accessibility)) points"
    echo ""
    echo "🔧 Review individual reports for specific issues to fix"
else
    echo "🎉 ACCESSIBILITY THRESHOLD MET!"
    echo "   All pages achieve 100/100 accessibility score"
fi

echo ""
echo "Next steps:"
echo "1. Review lighthouse-reports/SUMMARY.md for overview"
echo "2. Check individual HTML reports for detailed issues"
echo "3. Run Playwright accessibility tests for deeper analysis"
echo "4. Fix identified issues and re-test"