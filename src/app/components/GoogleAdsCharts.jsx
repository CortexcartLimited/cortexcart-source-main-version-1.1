'use client';
import StatCard from '@/app/components/StatCard';

export default function GoogleAdsCharts({ data, currencySymbol = '$' }) {
  if (!data || data.error) {
    // Show a helpful message if there's no data or an error
    return (
      <div className="p-8 text-center text-gray-500 bg-gray-50 rounded-lg border-2 border-dashed">
        <p className="text-lg font-medium mb-2">
          {data?.error ? "Could Not Load Ads Data" : "No Google Ads Data Available"}
        </p>
        <p className="text-sm">
          {data?.error || "Please ensure your Google Ads account is linked to this GA4 property."}
        </p>
      </div>
    );
  }

  // Helper to format currency
  const formatCurrency = (val) => `${currencySymbol}${parseFloat(val).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

  return (
    <div className="space-y-8">
      {/* 1. Key Stat Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <StatCard title="Ad Clicks" value={parseInt(data.advertiserAdClicks).toLocaleString()} icon="🖱️" className="border-none shadow-none" />
        <StatCard title="Impressions" value={parseInt(data.advertiserAdImpressions).toLocaleString()} icon="👁️" className="border-none shadow-none" />
        <StatCard title="Total Cost" value={formatCurrency(data.advertiserAdCost)} icon="💲" className="border-none shadow-none" />
        <StatCard title="Conversions" value={parseInt(data.advertiserAdConversions).toLocaleString()} icon="🎯" className="border-none shadow-none" />
      </div>

      {/* 2. Calculated Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="p-6 bg-blue-50 rounded-xl text-center">
          <div className="text-sm text-gray-500 uppercase font-semibold">Click-Through Rate (CTR)</div>
          <div className="text-3xl font-bold text-blue-600 mt-2">
            {((parseInt(data.advertiserAdClicks) / parseInt(data.advertiserAdImpressions)) * 100 || 0).toFixed(2)}%
          </div>
        </div>
        <div className="p-6 bg-green-50 rounded-xl text-center">
          <div className="text-sm text-gray-500 uppercase font-semibold">Cost Per Click (CPC)</div>
          <div className="text-3xl font-bold text-green-600 mt-2">
            {formatCurrency((parseFloat(data.advertiserAdCost) / parseInt(data.advertiserAdClicks)) || 0)}
          </div>
        </div>
        <div className="p-6 bg-purple-50 rounded-xl text-center">
          <div className="text-sm text-gray-500 uppercase font-semibold">Conversion Rate</div>
          <div className="text-3xl font-bold text-purple-600 mt-2">
            {((parseInt(data.advertiserAdConversions) / parseInt(data.advertiserAdClicks)) * 100 || 0).toFixed(2)}%
          </div>
        </div>
      </div>
    </div>
  );
}