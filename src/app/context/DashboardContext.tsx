'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
// import { v4 as uuidv4 } from 'uuid';
// Actually, let's use a simple ID generator since I didn't install uuid
const generateId = () => Math.random().toString(36).substr(2, 9);

// --- Types ---
export type WidgetSize = '1/3' | '1/2' | 'Full';

export interface DashboardWidget {
    id: string;
    type: string; // e.g., 'StatCard', 'SalesChart'
    size: WidgetSize;
    title?: string;
    props?: Record<string, any>; // Store simple config props here
}

export interface Dashboard {
    id: string;
    name: string;
    isCustom: boolean;
    widgets: DashboardWidget[];
}

export interface DashboardContextType {
    dashboards: Dashboard[];
    activeDashboardId: string;
    activeDashboard: Dashboard | undefined;
    isEditMode: boolean;

    // Actions
    setActiveDashboardId: (id: string) => void;
    toggleEditMode: () => void;
    addDashboard: (name: string) => void;
    deleteDashboard: (id: string) => void;
    addWidget: (dashboardId: string, widgetType: string, size?: WidgetSize, props?: any) => void;
    removeWidget: (dashboardId: string, widgetId: string) => void;
    updateWidget: (dashboardId: string, widgetId: string, updates: Partial<DashboardWidget>) => void;
    updateLayout: (dashboardId: string, newWidgets: DashboardWidget[]) => void;
    updateWidgetSize: (dashboardId: string, widgetId: string, newSize: WidgetSize) => void;
    resetDashboards: () => void;
}

const DashboardContext = createContext<DashboardContextType | undefined>(undefined);

// --- Default Configuration ---
// This mimics the structure of the existing dashboard to provide a "Default" view
const DEFAULT_WIDGETS: DashboardWidget[] = [
    { id: 'stat-revenue', type: 'StatCard', size: '1/3', props: { title: 'Total Revenue', icon: '💰', dataKey: 'revenue' } },
    { id: 'stat-sales', type: 'StatCard', size: '1/3', props: { title: 'Total Sales', icon: '🛒', dataKey: 'sales' } },
    { id: 'stat-views', type: 'StatCard', size: '1/3', props: { title: 'Page Views', icon: '👁️', dataKey: 'pageviews' } },
    { id: 'chart-sales', type: 'SalesBarChart', size: 'Full', props: { title: 'Sales by Day' } },
    { id: 'list-referrers', type: 'TopReferrersList', size: '1/2', props: { title: 'Top Referrers' } },
    { id: 'timeline-events', type: 'ActivityTimeline', size: '1/2', props: { title: 'Recent Events' } },
    { id: 'chart-top-pages', type: 'TopPagesChart', size: '1/2', props: { title: 'Top Pages' } },
    { id: 'chart-social-pie', type: 'SocialPlatformPie', size: '1/2', props: { title: 'Social Traffic' } },
    { id: 'chart-social-reach', type: 'SocialReachChart', size: 'Full', props: { title: 'Social Reach' } },
    { id: 'table-traffic', type: 'TrafficSourceTable', size: 'Full', props: { title: 'Traffic Sources' } }, // Originally 2/3 but mapping to Full for simplicity first
    { id: 'list-social-posts', type: 'TopSocialPosts', size: 'Full', props: { title: 'Top Social Posts' } }, // Originally 1/3
];

const DEFAULT_DASHBOARD: Dashboard = {
    id: 'default-cortex',
    name: 'Default Dashboard',
    isCustom: false,
    widgets: DEFAULT_WIDGETS,
};

const GA4_WIDGETS: DashboardWidget[] = [
    { id: 'ga4-users', type: 'StatCard', size: '1/3', props: { title: 'Total Users', icon: '👥', dataKey: 'ga4Users' } },
    { id: 'ga4-sessions', type: 'StatCard', size: '1/3', props: { title: 'Sessions', icon: '💻', dataKey: 'ga4Sessions' } },
    { id: 'ga4-views', type: 'StatCard', size: '1/3', props: { title: 'Page Views', icon: '👁️', dataKey: 'ga4Pageviews' } },
    { id: 'ga4-conv', type: 'StatCard', size: '1/3', props: { title: 'Conversions', icon: '🎯', dataKey: 'ga4Conversions' } },
    { id: 'ga4-line', type: 'Ga4LineChart', size: 'Full', props: { title: 'Page Views & Conversions' } },
];

const GA4_DASHBOARD: Dashboard = {
    id: 'default-ga4',
    name: 'Google Analytics 4',
    isCustom: false,
    widgets: GA4_WIDGETS,
};


export const DashboardProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [dashboards, setDashboards] = useState<Dashboard[]>([DEFAULT_DASHBOARD, GA4_DASHBOARD]);
    const [activeDashboardId, setActiveDashboardId] = useState<string>(DEFAULT_DASHBOARD.id);
    const [isEditMode, setIsEditMode] = useState(false);
    const [isLoaded, setIsLoaded] = useState(false);

    // Load from localStorage on mount
    useEffect(() => {
        const saved = localStorage.getItem('cortex_dashboards');
        if (saved) {
            try {
                const parsed = JSON.parse(saved);
                setDashboards(parsed);
            } catch (e) {
                console.error("Failed to load dashboards", e);
            }
        }
        const savedActive = localStorage.getItem('cortex_active_dashboard');
        if (savedActive) {
            setActiveDashboardId(savedActive);
        }
        setIsLoaded(true);
    }, []);

    // Save to localStorage on change
    useEffect(() => {
        if (isLoaded) {
            localStorage.setItem('cortex_dashboards', JSON.stringify(dashboards));
        }
    }, [dashboards, isLoaded]);

    useEffect(() => {
        if (isLoaded) {
            localStorage.setItem('cortex_active_dashboard', activeDashboardId);
        }
    }, [activeDashboardId, isLoaded]);

    const addDashboard = (name: string) => {
        const newDash: Dashboard = {
            id: `custom-${generateId()}`,
            name,
            isCustom: true,
            widgets: []
        };
        setDashboards([...dashboards, newDash]);
        setActiveDashboardId(newDash.id);
        setIsEditMode(true); // Auto enter edit mode for new dashboard
    };

    const deleteDashboard = (id: string) => {
        const newDashboards = dashboards.filter(d => d.id !== id);
        setDashboards(newDashboards);
        if (activeDashboardId === id) {
            setActiveDashboardId(newDashboards[0]?.id || DEFAULT_DASHBOARD.id);
        }
    };

    const addWidget = (dashboardId: string, widgetType: string, size: WidgetSize = '1/3', props: any = {}) => {
        setDashboards(prev => prev.map(dash => {
            if (dash.id !== dashboardId) return dash;
            return {
                ...dash,
                widgets: [...dash.widgets, {
                    id: `${widgetType}-${generateId()}`,
                    type: widgetType,
                    size,
                    props
                }]
            };
        }));
    };

    const removeWidget = (dashboardId: string, widgetId: string) => {
        setDashboards(prev => prev.map(dash => {
            if (dash.id !== dashboardId) return dash;
            return {
                ...dash,
                widgets: dash.widgets.filter(w => w.id !== widgetId)
            };
        }));
    };

    const updateWidget = (dashboardId: string, widgetId: string, updates: Partial<DashboardWidget>) => {
        setDashboards(prev => prev.map(dash => {
            if (dash.id !== dashboardId) return dash;
            return {
                ...dash,
                widgets: dash.widgets.map(w => w.id === widgetId ? { ...w, ...updates } : w)
            };
        }));
    };

    const updateLayout = (dashboardId: string, newWidgets: DashboardWidget[]) => {
        setDashboards(prev => prev.map(dash => {
            if (dash.id !== dashboardId) return dash;
            return { ...dash, widgets: newWidgets };
        }));
    };

    const updateWidgetSize = (dashboardId: string, widgetId: string, newSize: WidgetSize) => {
        setDashboards(prev => prev.map(dash => {
            if (dash.id !== dashboardId) return dash;
            return {
                ...dash,
                widgets: dash.widgets.map(w => w.id === widgetId ? { ...w, size: newSize } : w)
            };
        }));
    };

    const resetDashboards = () => {
        setDashboards([DEFAULT_DASHBOARD, GA4_DASHBOARD]);
        setActiveDashboardId(DEFAULT_DASHBOARD.id);
        localStorage.removeItem('cortex_dashboards');
    };

    const activeDashboard = dashboards.find(d => d.id === activeDashboardId);

    return (
        <DashboardContext.Provider value={{
            dashboards,
            activeDashboardId,
            activeDashboard,
            isEditMode,
            setActiveDashboardId,
            toggleEditMode: () => setIsEditMode(prev => !prev),
            addDashboard,
            deleteDashboard,
            addWidget,
            removeWidget,
            updateWidget,
            updateLayout,
            updateWidgetSize,
            resetDashboards
        }}>
            {children}
        </DashboardContext.Provider>
    );
};

export const useDashboard = () => {
    const context = useContext(DashboardContext);
    if (context === undefined) {
        throw new Error('useDashboard must be used within a DashboardProvider');
    }
    return context;
};
