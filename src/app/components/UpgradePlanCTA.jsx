import React from 'react';
import Link from 'next/link';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/app/components/ui/card";
import { Button } from "@/app/components/ui/button";
import { Sparkles } from 'lucide-react';

export default function UpgradePlanCTA({
    title = "Upgrade your Plan",
    description = "You need an active subscription to access this feature.",
    buttonText = "View Plans"
}) {
    return (
        <Card className="max-w-md mx-auto mt-8 border-dashed border-2 border-blue-200 dark:border-blue-800 bg-blue-50/50 dark:bg-blue-900/10">
            <CardHeader className="text-center">
                <div className="mx-auto bg-blue-100 dark:bg-blue-900/50 p-3 rounded-full w-fit mb-2">
                    <Sparkles className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                </div>
                <CardTitle className="text-xl text-blue-900 dark:text-blue-100">{title}</CardTitle>
            </CardHeader>
            <CardContent>
                <p className="text-center text-gray-600 dark:text-gray-300">
                    {description}
                </p>
            </CardContent>
            <CardFooter className="flex justify-center">
                <Button asChild className="bg-blue-600 hover:bg-blue-700 text-white">
                    <Link href="/upgrade-plans">
                        {buttonText}
                    </Link>
                </Button>
            </CardFooter>
        </Card>
    );
}
