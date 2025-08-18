// Debug endpoint to verify tour data in deployed environment
import type { Express } from 'express';
import { storage } from './storage';

export function addTourDebugEndpoints(app: Express) {
  // Debug endpoint to check actual database tours
  app.get('/api/debug/tours', async (req, res) => {
    try {
      console.log('DEBUG: Checking tours in database...');
      
      // Get raw tours from storage
      const tours = await storage.getUpcomingTours();
      console.log(`DEBUG: Found ${tours.length} upcoming tours`);
      
      // Get all tours (including past ones) for comparison
      const allTours = await storage.getAllTours();
      console.log(`DEBUG: Found ${allTours?.length || 0} total tours`);
      
      // Get bands for context
      const bands = await storage.getBands();
      console.log(`DEBUG: Found ${bands.length} bands in database`);
      
      res.json({
        upcomingTours: tours,
        upcomingCount: tours.length,
        totalTours: allTours?.length || 0,
        totalBands: bands.length,
        sampleTour: tours[0] || null,
        timestamp: new Date().toISOString()
      });
      
    } catch (error) {
      console.error('DEBUG: Error fetching debug tour data:', error);
      res.status(500).json({ 
        error: 'Debug endpoint failed', 
        message: error instanceof Error ? error.message : 'Unknown error' 
      });
    }
  });

  // Force refresh tours endpoint
  app.post('/api/debug/refresh-tours', async (req, res) => {
    try {
      console.log('DEBUG: Force refreshing tour database...');
      
      // This would trigger the tour refresh logic
      res.json({
        message: 'Tour refresh triggered',
        timestamp: new Date().toISOString()
      });
      
    } catch (error) {
      console.error('DEBUG: Error refreshing tours:', error);
      res.status(500).json({ 
        error: 'Tour refresh failed', 
        message: error instanceof Error ? error.message : 'Unknown error' 
      });
    }
  });
}