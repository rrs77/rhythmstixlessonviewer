import React, { useState, useEffect } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/Tabs";
import { UnitViewer } from "./UnitViewer";
import { LessonPlanBuilder } from "./LessonPlanBuilder";
import { LessonPlannerCalendar } from "./LessonPlannerCalendar";
import { ActivityLibrary } from "./ActivityLibrary";
import { LessonLibrary } from "./LessonLibrary";
import { UnitManager } from "./UnitManager";
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { Calendar, BookOpen, Edit3, GraduationCap, FolderOpen, Tag, Book } from 'lucide-react';
import { useData } from '../contexts/DataContext';
import { useSettings } from '../contexts/SettingsContext';
import { useAuth } from '../hooks/useAuth';
import type { Activity } from '../contexts/DataContext';

interface Unit {
  id: string;
  name: string;
  description: string;
  lessonNumbers: string[];
  color: string;
  term?: string;
  createdAt: Date;
  updatedAt: Date;
}

export function Dashboard() {
  const { user } = useAuth();
  const { currentSheetInfo } = useData();
  const { getThemeForClass } = useSettings();
  const [activeTab, setActiveTab] = useState('unit-viewer');
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [lessonPlans, setLessonPlans] = useState<any[]>([]);
  const [selectedCategory, setSelectedCategory] = useState('all');
  
  // Get theme colors for current class
  const theme = getThemeForClass(currentSheetInfo.sheet);

  // Load lesson plans from localStorage
  React.useEffect(() => {
    const savedPlans = localStorage.getItem('lesson-plans');
    if (savedPlans) {
      const plans = JSON.parse(savedPlans).map((plan: any) => ({
        ...plan,
        date: new Date(plan.date),
        createdAt: new Date(plan.createdAt),
        updatedAt: new Date(plan.updatedAt),
      }));
      setLessonPlans(plans);
    }
  }, []);

  // Save lesson plans to localStorage
  const saveLessonPlans = (plans: any[]) => {
    localStorage.setItem('lesson-plans', JSON.stringify(plans));
    setLessonPlans(plans);
  };

  const handleDateSelect = (date: Date) => {
    setSelectedDate(date);
    setActiveTab('lesson-builder');
  };

  const handleCreateLessonPlan = (date: Date) => {
    const weekNumber = Math.ceil(
      (date.getTime() - new Date(date.getFullYear(), 0, 1).getTime()) / 
      (7 * 24 * 60 * 60 * 1000)
    );

    const newPlan = {
      id: `plan-${Date.now()}`,
      date,
      week: weekNumber,
      className: currentSheetInfo.sheet,
      activities: [],
      duration: 0,
      notes: '',
      status: 'planned',
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const updatedPlans = [...lessonPlans, newPlan];
    saveLessonPlans(updatedPlans);
    setActiveTab('lesson-builder');
  };

  const handleUpdateLessonPlan = (updatedPlan: any) => {
    const updatedPlans = lessonPlans.map(plan => 
      plan.id === updatedPlan.id ? { ...updatedPlan, updatedAt: new Date() } : plan
    );
    
    if (!lessonPlans.find(plan => plan.id === updatedPlan.id)) {
      updatedPlans.push({ ...updatedPlan, updatedAt: new Date() });
    }
    
    saveLessonPlans(updatedPlans);
  };

  const handleActivityAdd = (activity: Activity) => {
    // This would be handled by the LessonPlanBuilder component
    console.log('Activity added:', activity);
  };

  const handleAddUnitToCalendar = (unit: Unit, startDate: Date) => {
    // Create a lesson plan for each lesson in the unit
    const weekNumber = Math.ceil(
      (startDate.getTime() - new Date(startDate.getFullYear(), 0, 1).getTime()) / 
      (7 * 24 * 60 * 60 * 1000)
    );
    
    const newPlans = unit.lessonNumbers.map((lessonNumber, index) => {
      // Calculate date for this lesson (each lesson is 1 day apart)
      const lessonDate = new Date(startDate);
      lessonDate.setDate(lessonDate.getDate() + index);
      
      return {
        id: `plan-${Date.now()}-${index}`,
        date: lessonDate,
        week: weekNumber,
        className: currentSheetInfo.sheet,
        activities: [], // These would be populated from the lesson data
        duration: 0,
        notes: `Part of unit: ${unit.name}`,
        status: 'planned',
        unitId: unit.id,
        unitName: unit.name,
        lessonNumber,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
    });
    
    const updatedPlans = [...lessonPlans, ...newPlans];
    saveLessonPlans(updatedPlans);
    
    // Switch to calendar view
    setActiveTab('calendar');
  };

  const handleLessonSelect = (lessonNumber: string) => {
    // Navigate to lesson builder with the selected lesson
    setActiveTab('lesson-builder');
    // The LessonPlanBuilder would need to be updated to accept an initialLessonId prop
    // and load that lesson when it mounts
  };

  return (
    <DndProvider backend={HTML5Backend}>
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50">
        <div className="max-w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Main Tabs */}
          <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-8">
            <TabsList className="bg-white shadow-md rounded-xl p-1 border border-gray-200">
              <TabsTrigger 
                value="unit-viewer"
                className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500 data-[state=active]:to-indigo-600 data-[state=active]:text-white rounded-lg px-4 py-2 transition-all duration-200"
                style={{ 
                  '--tw-gradient-from': theme.primary,
                  '--tw-gradient-to': theme.secondary
                } as React.CSSProperties}
                data-tab="unit-viewer"
              >
                <div className="flex items-center space-x-2">
                  <GraduationCap className="h-5 w-5" />
                  <span>Unit Viewer</span>
                </div>
              </TabsTrigger>
              
              <TabsTrigger 
                value="unit-builder"
                className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-indigo-500 data-[state=active]:to-purple-600 data-[state=active]:text-white rounded-lg px-4 py-2 transition-all duration-200"
                data-tab="unit-builder"
              >
                <div className="flex items-center space-x-2">
                  <FolderOpen className="h-5 w-5" />
                  <span>Unit Builder</span>
                </div>
              </TabsTrigger>
              
              <TabsTrigger 
                value="lesson-library"
                className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-green-500 data-[state=active]:to-teal-600 data-[state=active]:text-white rounded-lg px-4 py-2 transition-all duration-200"
                data-tab="lesson-library"
              >
                <div className="flex items-center space-x-2">
                  <Book className="h-5 w-5" />
                  <span>Lesson Library</span>
                </div>
              </TabsTrigger>
              
              <TabsTrigger 
                value="lesson-builder"
                className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-green-500 data-[state=active]:to-emerald-600 data-[state=active]:text-white rounded-lg px-4 py-2 transition-all duration-200"
                data-tab="lesson-builder"
              >
                <div className="flex items-center space-x-2">
                  <Edit3 className="h-5 w-5" />
                  <span>Lesson Builder</span>
                </div>
              </TabsTrigger>
              
              <TabsTrigger 
                value="activity-library"
                className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-pink-500 data-[state=active]:to-rose-600 data-[state=active]:text-white rounded-lg px-4 py-2 transition-all duration-200"
                data-tab="activity-library"
              >
                <div className="flex items-center space-x-2">
                  <Tag className="h-5 w-5" />
                  <span>Activity Library</span>
                </div>
              </TabsTrigger>
              
              <TabsTrigger 
                value="calendar"
                className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-500 data-[state=active]:to-pink-600 data-[state=active]:text-white rounded-lg px-4 py-2 transition-all duration-200"
                data-tab="calendar"
              >
                <div className="flex items-center space-x-2">
                  <Calendar className="h-5 w-5" />
                  <span>Calendar</span>
                </div>
              </TabsTrigger>
            </TabsList>

            <TabsContent value="unit-viewer" className="mt-6">
              <UnitViewer />
            </TabsContent>

            <TabsContent value="unit-builder" className="mt-6">
              <UnitManager 
                isOpen={true} 
                onClose={() => {}} 
                onAddToCalendar={handleAddUnitToCalendar}
                embedded={true}
              />
            </TabsContent>

            <TabsContent value="lesson-library" className="mt-6">
              <LessonLibrary 
                onLessonSelect={handleLessonSelect}
                className={currentSheetInfo.sheet}
              />
            </TabsContent>

            <TabsContent value="lesson-builder" className="mt-6">
              <LessonPlanBuilder />
            </TabsContent>

            <TabsContent value="activity-library" className="mt-6">
              <ActivityLibrary
                onActivitySelect={handleActivityAdd}
                selectedActivities={[]}
                className={currentSheetInfo.sheet}
                selectedCategory={selectedCategory}
                onCategoryChange={setSelectedCategory}
              />
            </TabsContent>

            <TabsContent value="calendar" className="mt-6">
              <LessonPlannerCalendar
                onDateSelect={handleDateSelect}
                selectedDate={selectedDate}
                lessonPlans={lessonPlans}
                onUpdateLessonPlan={handleUpdateLessonPlan}
                onCreateLessonPlan={handleCreateLessonPlan}
                className={currentSheetInfo.sheet}
              />
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </DndProvider>
  );
}