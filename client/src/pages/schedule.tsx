import { useEffect, useState } from "react";
import { useAppContext } from "@/contexts/app-context";
import { scheduleData } from "@/data/scheduleData";
import { format, addDays, subDays } from "date-fns";

type ActivityStatus = "completed" | "current" | "upcoming";

interface Activity {
  id: string;
  time: string;
  title: string;
  description: string;
  status: ActivityStatus;
}

interface TimeSection {
  name: string;
  icon: string;
  iconColor: string;
  activities: Activity[];
}

export default function Schedule() {
  const { setCurrentPage, userName } = useAppContext();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [schedule, setSchedule] = useState<TimeSection[]>(scheduleData);

  useEffect(() => {
    setCurrentPage("/schedule");
  }, [setCurrentPage]);

  const goToNextDay = () => {
    setCurrentDate(addDays(currentDate, 1));
  };

  const goToPreviousDay = () => {
    setCurrentDate(subDays(currentDate, 1));
  };

  const isToday = format(currentDate, "yyyy-MM-dd") === format(new Date(), "yyyy-MM-dd");

  const getStatusClass = (status: ActivityStatus) => {
    switch (status) {
      case "completed":
        return "bg-green-100 text-green-800 border-green-500";
      case "current":
        return "bg-blue-100 text-blue-800 border-blue-500";
      case "upcoming":
        return "bg-gray-100 text-gray-800 border-gray-300";
    }
  };

  const updateActivityStatus = (sectionIndex: number, activityIndex: number, newStatus: ActivityStatus) => {
    const updatedSchedule = [...schedule];
    updatedSchedule[sectionIndex].activities[activityIndex].status = newStatus;
    setSchedule(updatedSchedule);
  };

  return (
    <section className="h-full flex flex-col">
      <div className="p-4 bg-white border-b border-gray-200">
        <h2 className="text-xl font-bold text-center mb-2">Today's Schedule</h2>
        <p className="text-center text-gray-600 mb-4">
          {userName ? `${userName}'s` : "Your"} daily activities
        </p>
        
        {/* Date Selection */}
        <div className="flex justify-center mb-4">
          <button 
            className="p-2 text-gray-600"
            onClick={goToPreviousDay}
          >
            <i className="ri-arrow-left-s-line"></i>
          </button>
          <div className="px-4 py-2 font-semibold">
            {isToday ? "Today" : ""}: {format(currentDate, "MMMM d, yyyy")}
          </div>
          <button 
            className="p-2 text-gray-600"
            onClick={goToNextDay}
          >
            <i className="ri-arrow-right-s-line"></i>
          </button>
        </div>
      </div>
      
      <div className="flex-grow overflow-y-auto p-4 bg-gray-50">
        <div className="space-y-4">
          {schedule.map((section, sectionIndex) => (
            <div key={section.name}>
              <h3 className="font-bold text-gray-700 mb-2 flex items-center">
                <i className={`${section.icon} text-${section.iconColor} mr-2`}></i>
                {section.name}
              </h3>
              
              <div className="space-y-2">
                {section.activities.map((activity, activityIndex) => (
                  <div key={activity.id} className="bg-white rounded-md border border-gray-200 overflow-hidden">
                    <div className={`flex items-center p-3 border-l-4 ${getStatusClass(activity.status)}`}>
                      <div className={`font-semibold w-20 ${activity.status === "upcoming" ? "text-gray-600" : activity.status === "current" ? "text-blue-600" : "text-green-600"}`}>
                        {activity.time}
                      </div>
                      <div className="flex-grow">
                        <div className="font-medium">{activity.title}</div>
                        <div className="text-sm text-gray-500">{activity.description}</div>
                      </div>
                      <div className="flex items-center">
                        <div className={`text-xs px-2 py-1 rounded mr-2 ${getStatusClass(activity.status)}`}>
                          {activity.status.charAt(0).toUpperCase() + activity.status.slice(1)}
                        </div>
                        <div className="relative group">
                          <button className="p-2 text-gray-400 hover:text-gray-600">
                            <i className="ri-more-2-fill"></i>
                          </button>
                          <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg z-20 hidden group-hover:block">
                            <div className="py-1">
                              <button 
                                className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full text-left"
                                onClick={() => updateActivityStatus(sectionIndex, activityIndex, "completed")}
                              >
                                Mark as Completed
                              </button>
                              <button 
                                className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full text-left"
                                onClick={() => updateActivityStatus(sectionIndex, activityIndex, "current")}
                              >
                                Mark as Current
                              </button>
                              <button 
                                className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full text-left"
                                onClick={() => updateActivityStatus(sectionIndex, activityIndex, "upcoming")}
                              >
                                Mark as Upcoming
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
      
      {/* Action buttons */}
      <div className="p-4 bg-white border-t border-gray-200">
        <div className="flex justify-center space-x-4">
          <button className="flex items-center justify-center px-4 py-2 rounded-md bg-accent text-white">
            <i className="ri-add-line mr-1"></i>
            Add Activity
          </button>
          <button className="flex items-center justify-center px-4 py-2 rounded-md bg-secondary text-white">
            <i className="ri-save-line mr-1"></i>
            Save Routine
          </button>
        </div>
      </div>
    </section>
  );
}
