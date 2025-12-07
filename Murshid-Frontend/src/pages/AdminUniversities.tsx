import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import Navbar from '@/components/Navbar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card } from '@/components/ui/card';
import ImageUpload from '@/components/ImageUpload';
import { 
  Plus, 
  Edit, 
  Trash2, 
  Search, 
  Building2, 
  X,
  Upload,
  FileText
} from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { 
  getUniversities, 
  createUniversity, 
  updateUniversity, 
  deleteUniversity,
  bulkCreateUniversities,
  bulkAssignMajorsToUniversities
} from '@/lib/universitiesApi';
import { getMajors } from '@/lib/majorsApi';
import type { University, UniversityType } from '@/types/database';
import { toast } from 'sonner';

export default function AdminUniversities() {
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const [universities, setUniversities] = useState<University[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [bulkImportDialogOpen, setBulkImportDialogOpen] = useState(false);
  const [editingUniversity, setEditingUniversity] = useState<University | null>(null);
  const [bulkImportData, setBulkImportData] = useState('');
  const [bulkImportFormat, setBulkImportFormat] = useState<'json' | 'csv'>('json');
  const [bulkImportLoading, setBulkImportLoading] = useState(false);
  const [assignAllMajors, setAssignAllMajors] = useState(true);
  const [formData, setFormData] = useState({
    name: '',
    name_ar: '',
    description: '',
    description_ar: '',
    city: '',
    location: '',
    location_ar: '',
    country: 'Saudi Arabia',
    university_type: 'Public' as UniversityType,
    website_url: '',
    logo_url: '',
    establishment_year: new Date().getFullYear(),
    ranking_national: 0,
    student_count: 0,
    contact_email: '',
    contact_phone: '',
  });

  useEffect(() => {
    // Don't check admin access while still loading
    if (authLoading) {
      return;
    }
    
    if (!user?.is_admin) {
      navigate('/');
      return;
    }
    fetchUniversities();
  }, [user, authLoading, navigate]);

  const fetchUniversities = async () => {
    try {
      setLoading(true);
      const data = await getUniversities();
      setUniversities(data);
    } catch (error) {
      console.error('Error fetching universities:', error);
      toast.error('Failed to load universities');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const universityData = {
        ...formData,
        is_active: true,
        created_by: user?.id,
      };

      if (editingUniversity) {
        await updateUniversity(editingUniversity.id, universityData);
        toast.success('University updated successfully');
      } else {
        await createUniversity(universityData as any);
        toast.success('University created successfully');
      }

      setDialogOpen(false);
      resetForm();
      fetchUniversities();
    } catch (error) {
      console.error('Error saving university:', error);
      toast.error('Failed to save university');
    }
  };

  const handleEdit = (university: University) => {
    setEditingUniversity(university);
    setFormData({
      name: university.name,
      name_ar: university.name_ar || '',
      description: university.description || '',
      description_ar: university.description_ar || '',
      city: university.city || '',
      location: university.location || '',
      location_ar: university.location_ar || '',
      country: university.country || 'Saudi Arabia',
      university_type: university.university_type || 'Public',
      website_url: university.website_url || '',
      logo_url: university.logo_url || '',
      establishment_year: university.establishment_year || new Date().getFullYear(),
      ranking_national: university.ranking_national || 0,
      student_count: university.student_count || 0,
      contact_email: university.contact_email || '',
      contact_phone: university.contact_phone || '',
    });
    setDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this university?')) return;

    try {
      await deleteUniversity(id);
      toast.success('University deleted successfully');
      fetchUniversities();
    } catch (error) {
      console.error('Error deleting university:', error);
      toast.error('Failed to delete university');
    }
  };

  const resetForm = () => {
    setEditingUniversity(null);
    setFormData({
      name: '',
      name_ar: '',
      description: '',
      description_ar: '',
      city: '',
      location: '',
      location_ar: '',
      country: 'Saudi Arabia',
      university_type: 'Public',
      website_url: '',
      logo_url: '',
      establishment_year: new Date().getFullYear(),
      ranking_national: 0,
      student_count: 0,
      contact_email: '',
      contact_phone: '',
    });
  };

  const parseBulkImport = (data: string, format: 'json' | 'csv'): {
    universities: Omit<University, 'id' | 'created_at' | 'updated_at'>[];
    majorAssignments: Map<string, string[]>; // university name -> major names array
  } => {
    const majorAssignments = new Map<string, string[]>();
    
    if (format === 'json') {
      try {
        const parsed = JSON.parse(data);
        if (!Array.isArray(parsed)) {
          throw new Error('JSON must be an array of universities');
        }
        const universities = parsed.map((uni: any) => {
          const universityName = uni.name || '';
          
          // Extract major names if specified
          if (uni.majors && Array.isArray(uni.majors)) {
            majorAssignments.set(universityName, uni.majors);
          } else if (uni.major_names && Array.isArray(uni.major_names)) {
            majorAssignments.set(universityName, uni.major_names);
          }
          
          return {
            name: universityName,
            name_ar: uni.name_ar || '',
            description: uni.description || '',
            description_ar: uni.description_ar || '',
            city: uni.city || '',
            location: uni.location || '',
            location_ar: uni.location_ar || '',
            country: uni.country || 'Saudi Arabia',
            university_type: (uni.university_type || 'Public') as UniversityType,
            website_url: uni.website_url || '',
            logo_url: uni.logo_url || '',
            establishment_year: uni.establishment_year ? parseInt(uni.establishment_year) : undefined,
            ranking_national: uni.ranking_national ? parseInt(uni.ranking_national) : undefined,
            student_count: uni.student_count ? parseInt(uni.student_count) : undefined,
            contact_email: uni.contact_email || '',
            contact_phone: uni.contact_phone || '',
          };
        });
        
        return { universities, majorAssignments };
      } catch (error) {
        throw new Error(`Invalid JSON: ${error instanceof Error ? error.message : 'Unknown error'}`);
      }
    } else {
      // CSV parsing
      const lines = data.trim().split('\n');
      if (lines.length < 2) {
        throw new Error('CSV must have at least a header row and one data row');
      }
      
      const headers = lines[0].split(',').map(h => h.trim().toLowerCase());
      const requiredFields = ['name', 'city'];
      const missingFields = requiredFields.filter(f => !headers.includes(f));
      if (missingFields.length > 0) {
        throw new Error(`Missing required CSV columns: ${missingFields.join(', ')}`);
      }

      const universities = lines.slice(1).map((line, index) => {
        const values = line.split(',').map(v => v.trim());
        const uni: any = {};
        headers.forEach((header, i) => {
          uni[header] = values[i] || '';
        });

        const universityName = uni.name || '';
        
        // Extract major names if specified in CSV (comma-separated in a column)
        if (uni.majors) {
          const majorsList = uni.majors.split(';').map((m: string) => m.trim()).filter(Boolean);
          if (majorsList.length > 0) {
            majorAssignments.set(universityName, majorsList);
          }
        }

        return {
          name: universityName,
          name_ar: uni.name_ar || '',
          description: uni.description || '',
          description_ar: uni.description_ar || '',
          city: uni.city || '',
          location: uni.location || '',
          location_ar: uni.location_ar || '',
          country: uni.country || 'Saudi Arabia',
          university_type: (uni.university_type || uni.type || 'Public') as UniversityType,
          website_url: uni.website_url || uni.website || '',
          logo_url: uni.logo_url || uni.logo || '',
          establishment_year: uni.establishment_year ? parseInt(uni.establishment_year) : undefined,
          ranking_national: uni.ranking_national ? parseInt(uni.ranking_national) : undefined,
          student_count: uni.student_count ? parseInt(uni.student_count) : undefined,
          contact_email: uni.contact_email || uni.email || '',
          contact_phone: uni.contact_phone || uni.phone || '',
        };
      }).filter(uni => uni.name); // Filter out empty rows
      
      return { universities, majorAssignments };
    }
  };

  const handleBulkImport = async () => {
    if (!bulkImportData.trim()) {
      toast.error('Please provide data to import');
      return;
    }

    try {
      setBulkImportLoading(true);
      const { universities, majorAssignments } = parseBulkImport(bulkImportData, bulkImportFormat);
      
      if (universities.length === 0) {
        toast.error('No valid universities found in the data');
        return;
      }

      // Determine which majors to assign
      let majorIdsToAssign: string[] = [];
      const hasSpecificMajors = majorAssignments.size > 0;
      
      if (hasSpecificMajors) {
        // Get all majors to match names
        const allMajors = await getMajors();
        const majorNameToId = new Map<string, string>();
        allMajors.forEach(major => {
          if (major.name) majorNameToId.set(major.name.toLowerCase(), major.id);
          if (major.name_ar) majorNameToId.set(major.name_ar.toLowerCase(), major.id);
        });
        
        // Collect unique major IDs from all universities
        const uniqueMajorIds = new Set<string>();
        majorAssignments.forEach((majorNames, universityName) => {
          majorNames.forEach(majorName => {
            const majorId = majorNameToId.get(majorName.toLowerCase());
            if (majorId) {
              uniqueMajorIds.add(majorId);
            } else {
              console.warn(`Major "${majorName}" not found for university "${universityName}"`);
            }
          });
        });
        majorIdsToAssign = Array.from(uniqueMajorIds);
      } else if (assignAllMajors) {
        // Fetch all active majors
        const allMajors = await getMajors();
        majorIdsToAssign = allMajors.map(m => m.id);
      }

      const result = await bulkCreateUniversities(universities, user?.id, {
        assignAllMajors: !hasSpecificMajors && assignAllMajors,
        majorIds: hasSpecificMajors ? majorIdsToAssign : undefined,
      });
      
      if (result.success.length > 0) {
        // If specific majors were specified, assign them per university
        if (hasSpecificMajors) {
          const allMajors = await getMajors();
          const majorNameToId = new Map<string, string>();
          allMajors.forEach(major => {
            if (major.name) majorNameToId.set(major.name.toLowerCase(), major.id);
            if (major.name_ar) majorNameToId.set(major.name_ar.toLowerCase(), major.id);
          });
          
          // Assign specific majors to each university
          for (const university of result.success) {
            const majorNames = majorAssignments.get(university.name);
            if (majorNames && majorNames.length > 0) {
              const universityMajorIds = majorNames
                .map(name => majorNameToId.get(name.toLowerCase()))
                .filter((id): id is string => id !== undefined);
              
              if (universityMajorIds.length > 0) {
                await bulkAssignMajorsToUniversities([university.id], universityMajorIds);
              }
            }
          }
        }
        
        let message = `Successfully imported ${result.success.length} university(ies)`;
        if (hasSpecificMajors) {
          message += ` with specified majors assigned`;
        } else if (assignAllMajors) {
          message += ` with all available majors assigned`;
        }
        toast.success(message);
        setBulkImportDialogOpen(false);
        setBulkImportData('');
        fetchUniversities();
      }
      
      if (result.errors.length > 0) {
        toast.error(`Failed to import ${result.errors.length} university(ies)`);
      }
    } catch (error) {
      console.error('Error bulk importing universities:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to import universities');
    } finally {
      setBulkImportLoading(false);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      setBulkImportData(content);
      
      // Auto-detect format
      if (file.name.endsWith('.csv')) {
        setBulkImportFormat('csv');
      } else if (file.name.endsWith('.json')) {
        setBulkImportFormat('json');
      }
    };
    reader.readAsText(file);
  };

  const filteredUniversities = universities.filter(uni =>
    uni.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    uni.name_ar?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    uni.city?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="admin-layout min-h-screen bg-gray-50 dark:bg-gray-900">
      <Navbar />
      
      <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-10 pt-12 pb-20">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
              Manage Universities
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-2">
              Add, edit, and manage universities in the system
            </p>
          </div>
          <div className="flex gap-3">
            <Button
              onClick={() => {
                resetForm();
                setDialogOpen(true);
              }}
              id="admin-universities-add-button"
              className="bg-blue-500 hover:bg-blue-600 text-white rounded-2xl px-8 py-6 transition-all duration-300 hover:shadow-xl hover:-translate-y-1"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add University
            </Button>
            <Button
              onClick={() => {
                setBulkImportDialogOpen(true);
                setBulkImportData('');
                setBulkImportFormat('json');
                setAssignAllMajors(true);
              }}
              variant="outline"
              className="border-2 border-green-500 text-green-600 hover:bg-green-50 dark:hover:bg-green-900/20 rounded-2xl px-8 py-6 transition-all duration-300 hover:shadow-xl hover:-translate-y-1"
            >
              <Upload className="w-4 h-4 mr-2" />
              Bulk Import
            </Button>
          </div>
        </div>

        {/* Search */}
        <div className="mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <Input
              id="admin-universities-search-input"
              type="text"
              placeholder="Search universities..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        {/* Universities List */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredUniversities.map((university) => (
            <Card key={university.id} className="p-6 h-65 flex flex-col">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900 rounded-lg flex items-center justify-center">
                    <Building2 className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 dark:text-gray-100">
                      {university.name}
                    </h3>
                    {university.name_ar && (
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        {university.name_ar}
                      </p>
                    )}
                  </div>
                </div>
              </div>

              <div className="space-y-2 mb-4 text-sm flex-1">
                {university.city && (
                  <p className="text-gray-600 dark:text-gray-400">
                    📍 {university.city}
                  </p>
                )}
                {university.university_type && (
                  <p className="text-gray-600 dark:text-gray-400">
                    🏛️ {university.university_type}
                  </p>
                )}
                {university.establishment_year && (
                  <p className="text-gray-600 dark:text-gray-400">
                    📅 {university.establishment_year}
                  </p>
                )}
              </div>

              <div className="flex gap-2 mt-auto">
                <Button
                  onClick={() => handleEdit(university)}
                  id={`admin-universities-edit-${university.id}`}
                  variant="outline"
                  size="sm"
                  className="flex-1 rounded-xl border-2 hover:bg-blue-50 dark:hover:bg-blue-900/20 hover:text-blue-600 dark:hover:text-blue-400 transition-all duration-300 hover:shadow-lg hover:-translate-y-1"
                >
                  <Edit className="w-4 h-4 mr-1" />
                  Edit
                </Button>
                <Button
                  onClick={() => handleDelete(university.id)}
                  id={`admin-universities-delete-${university.id}`}
                  variant="destructive"
                  size="sm"
                  className="flex-1 rounded-xl transition-all duration-300 hover:shadow-lg hover:-translate-y-1"
                >
                  <Trash2 className="w-4 h-4 mr-1" />
                  Delete
                </Button>
              </div>
            </Card>
          ))}
        </div>

        {filteredUniversities.length === 0 && (
          <div className="text-center py-20">
            <Building2 className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600 dark:text-gray-400">No universities found</p>
          </div>
        )}
      </div>

      {/* Add/Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingUniversity ? 'Edit University' : 'Add New University'}
            </DialogTitle>
            <DialogDescription>
              Fill in the information below to {editingUniversity ? 'update' : 'create'} a university
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Logo Upload */}
            <div>
              <Label>University Logo</Label>
              <ImageUpload
                currentImage={formData.logo_url}
                onImageUpload={(url) => setFormData({ ...formData, logo_url: url })}
                bucket="university-logos"
                path={editingUniversity?.id || `temp-${Date.now()}`}
                label="Upload Logo"
                maxSizeMB={2}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="name">Name (English)*</Label>
                <Input
                  id="admin-universities-form-name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                />
              </div>
              <div>
                <Label htmlFor="admin-universities-form-name-ar">Name (Arabic)</Label>
                <Input
                  id="admin-universities-form-name-ar"
                  value={formData.name_ar}
                  onChange={(e) => setFormData({ ...formData, name_ar: e.target.value })}
                  dir="rtl"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="admin-universities-form-description">Description (English)</Label>
              <Textarea
                id="admin-universities-form-description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={3}
              />
            </div>

            <div>
              <Label htmlFor="admin-universities-form-description-ar">Description (Arabic)</Label>
              <Textarea
                id="admin-universities-form-description-ar"
                value={formData.description_ar}
                onChange={(e) => setFormData({ ...formData, description_ar: e.target.value })}
                rows={3}
                dir="rtl"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="admin-universities-form-city">City*</Label>
                <Input
                  id="admin-universities-form-city"
                  value={formData.city}
                  onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                  required
                />
              </div>
              <div>
                <Label htmlFor="admin-universities-form-type">Type*</Label>
                <Select 
                  value={formData.university_type} 
                  onValueChange={(value: UniversityType) => setFormData({ ...formData, university_type: value })}
                >
                  <SelectTrigger id="admin-universities-form-type">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Public">Public</SelectItem>
                    <SelectItem value="Private">Private</SelectItem>
                    <SelectItem value="International">International</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="admin-universities-form-location">Location (English)</Label>
                <Input
                  id="admin-universities-form-location"
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  placeholder="e.g., Al Malaz, Riyadh"
                />
                <p className="text-xs text-gray-500 mt-1">This will be displayed instead of city if provided</p>
              </div>
              <div>
                <Label htmlFor="admin-universities-form-location-ar">Location (Arabic)</Label>
                <Input
                  id="admin-universities-form-location-ar"
                  value={formData.location_ar}
                  onChange={(e) => setFormData({ ...formData, location_ar: e.target.value })}
                  placeholder="مثل: الملز، الرياض"
                  dir="rtl"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="admin-universities-form-establishment-year">Establishment Year</Label>
                <Input
                  id="admin-universities-form-establishment-year"
                  type="number"
                  value={formData.establishment_year}
                  onChange={(e) => setFormData({ ...formData, establishment_year: parseInt(e.target.value) })}
                />
              </div>
              <div>
                <Label htmlFor="admin-universities-form-student-count">Student Count</Label>
                <Input
                  id="admin-universities-form-student-count"
                  type="number"
                  value={formData.student_count}
                  onChange={(e) => setFormData({ ...formData, student_count: parseInt(e.target.value) })}
                />
              </div>
            </div>

            <div>
              <Label htmlFor="admin-universities-form-website">Website URL</Label>
              <Input
                id="admin-universities-form-website"
                type="url"
                value={formData.website_url}
                onChange={(e) => setFormData({ ...formData, website_url: e.target.value })}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="admin-universities-form-contact-email">Contact Email</Label>
                <Input
                  id="admin-universities-form-contact-email"
                  type="email"
                  value={formData.contact_email}
                  onChange={(e) => setFormData({ ...formData, contact_email: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="admin-universities-form-contact-phone">Contact Phone</Label>
                <Input
                  id="admin-universities-form-contact-phone"
                  value={formData.contact_phone}
                  onChange={(e) => setFormData({ ...formData, contact_phone: e.target.value })}
                />
              </div>
            </div>

            <DialogFooter>
              <Button
                type="button"
                id="admin-universities-form-cancel-button"
                variant="outline"
                className="rounded-2xl px-6 py-3 border-2 hover:bg-blue-50 dark:hover:bg-blue-900/20 hover:text-blue-600 dark:hover:text-blue-400 transition-all duration-300 hover:shadow-lg hover:-translate-y-1"
                onClick={() => {
                  setDialogOpen(false);
                  resetForm();
                }}
              >
                Cancel
              </Button>
              <Button type="submit" id="admin-universities-form-submit-button" className="bg-blue-500 hover:bg-blue-600 text-white rounded-2xl px-6 py-3 transition-all duration-300 hover:shadow-xl hover:-translate-y-1">
                {editingUniversity ? 'Update' : 'Create'} University
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Bulk Import Dialog */}
      <Dialog open={bulkImportDialogOpen} onOpenChange={setBulkImportDialogOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Bulk Import Universities</DialogTitle>
            <DialogDescription>
              Import multiple universities at once using JSON or CSV format
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            {/* Format Selection */}
            <div>
              <Label>Import Format</Label>
              <Select value={bulkImportFormat} onValueChange={(value: 'json' | 'csv') => setBulkImportFormat(value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="json">JSON</SelectItem>
                  <SelectItem value="csv">CSV</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* File Upload */}
            <div>
              <Label>Upload File (Optional)</Label>
              <div className="flex items-center gap-2">
                <Input
                  type="file"
                  accept={bulkImportFormat === 'json' ? '.json' : '.csv'}
                  onChange={handleFileUpload}
                  className="cursor-pointer"
                />
              </div>
            </div>

            {/* Data Input */}
            <div>
              <Label>
                {bulkImportFormat === 'json' ? 'JSON Data' : 'CSV Data'}
              </Label>
              <Textarea
                value={bulkImportData}
                onChange={(e) => setBulkImportData(e.target.value)}
                placeholder={
                  bulkImportFormat === 'json'
                    ? `[\n  {\n    "name": "King Saud University",\n    "name_ar": "جامعة الملك سعود",\n    "city": "Riyadh",\n    "university_type": "Public",\n    "majors": ["Computer Science", "Engineering", "Medicine"]\n  },\n  ...\n]`
                    : `name,name_ar,city,university_type,majors\nKing Saud University,جامعة الملك سعود,Riyadh,Public,"Computer Science;Engineering;Medicine"\n...`
                }
                rows={12}
                className="font-mono text-sm"
              />
            </div>

            {/* Format Help */}
            <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
              <div className="flex items-start gap-2">
                <FileText className="w-5 h-5 text-gray-500 mt-0.5" />
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  <p className="font-semibold mb-2">Required fields: name, city</p>
                  <p className="mb-1">Optional fields: name_ar, description, description_ar, location, location_ar, country, university_type (Public/Private/International), website_url, logo_url, establishment_year, ranking_national, student_count, contact_email, contact_phone</p>
                  <p className="mt-2 font-semibold">Major Assignment:</p>
                  <p className="mb-1">Add a "majors" field (array of major names) to assign specific majors to each university. If not specified, the checkbox below will determine if all majors are assigned.</p>
                  <p className="text-xs mt-1 text-gray-500">Example: "majors": ["Computer Science", "Engineering", "Medicine"]</p>
                </div>
              </div>
            </div>

            {/* Assign Majors Option */}
            <div className="flex items-center gap-2 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
              <input
                type="checkbox"
                id="assign-all-majors"
                checked={assignAllMajors}
                onChange={(e) => setAssignAllMajors(e.target.checked)}
                className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
              />
              <Label htmlFor="assign-all-majors" className="cursor-pointer text-sm font-medium text-gray-700 dark:text-gray-300">
                Automatically assign all available majors to imported universities
              </Label>
            </div>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setBulkImportDialogOpen(false);
                setBulkImportData('');
                setAssignAllMajors(true);
              }}
            >
              Cancel
            </Button>
            <Button
              onClick={handleBulkImport}
              disabled={bulkImportLoading || !bulkImportData.trim()}
              className="bg-green-500 hover:bg-green-600 text-white"
            >
              {bulkImportLoading ? 'Importing...' : 'Import Universities'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

