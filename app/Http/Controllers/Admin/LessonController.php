<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Course;
use App\Models\Lesson;
use App\Models\LessonImage;
use App\Models\LessonAudio;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class LessonController extends Controller
{
    /**
     * Store a newly created lesson in storage.
     */
    public function store(Request $request, Course $course)
    {
        $request->validate([
            'title' => 'required|string|max:255',
            'description' => 'nullable|string',
            'youtube_link' => 'nullable|url',
            'images' => 'nullable|array',
            'images.*' => 'image|max:5120',
            'audio_files' => 'nullable|array',
            'audio_files.*' => 'file|mimes:mp3,wav,ogg,aac,m4a|max:20480',
            'audio_titles' => 'nullable|array',
            'audio_titles.*' => 'nullable|string|max:255',
        ]);

        // Calculate sort order automatically
        $sortOrder = $course->lessons()->count() + 1;

        $lesson = Lesson::create([
            'course_id' => $course->id,
            'title' => $request->title,
            'description' => $request->description,
            'youtube_link' => $request->youtube_link,
            'sort_order' => $sortOrder,
        ]);

        // Save multiple images
        if ($request->hasFile('images')) {
            foreach ($request->file('images') as $imageFile) {
                $path = $imageFile->store('courses', 'public');
                $lesson->images()->create([
                    'image_path' => $path,
                ]);
            }
        }

        // Save multiple audios
        if ($request->hasFile('audio_files')) {
            $files = $request->file('audio_files');
            $titles = $request->input('audio_titles', []);
            foreach ($files as $index => $audioFile) {
                $path = $audioFile->store('courses', 'public');
                // Get corresponding title or fall back to file's original name
                $title = !empty($titles[$index]) ? $titles[$index] : pathinfo($audioFile->getClientOriginalName(), PATHINFO_FILENAME);
                $lesson->audios()->create([
                    'title' => $title,
                    'audio_path' => $path,
                ]);
            }
        }

        return back()->with('success', 'Lesson added to the adventure! 🌟');
    }

    /**
     * Update the specified lesson in storage.
     */
    public function update(Request $request, Lesson $lesson)
    {
        $request->validate([
            'title' => 'required|string|max:255',
            'description' => 'nullable|string',
            'youtube_link' => 'nullable|url',
            'images' => 'nullable|array',
            'images.*' => 'image|max:5120',
            'audio_files' => 'nullable|array',
            'audio_files.*' => 'file|mimes:mp3,wav,ogg,aac,m4a|max:20480',
            'audio_titles' => 'nullable|array',
            'audio_titles.*' => 'nullable|string|max:255',
        ]);

        $lesson->update([
            'title' => $request->title,
            'description' => $request->description,
            'youtube_link' => $request->youtube_link,
        ]);

        // Add more images if uploaded
        if ($request->hasFile('images')) {
            foreach ($request->file('images') as $imageFile) {
                $path = $imageFile->store('courses', 'public');
                $lesson->images()->create([
                    'image_path' => $path,
                ]);
            }
        }

        // Add more audios if uploaded
        if ($request->hasFile('audio_files')) {
            $files = $request->file('audio_files');
            $titles = $request->input('audio_titles', []);
            foreach ($files as $index => $audioFile) {
                $path = $audioFile->store('courses', 'public');
                $title = !empty($titles[$index]) ? $titles[$index] : pathinfo($audioFile->getClientOriginalName(), PATHINFO_FILENAME);
                $lesson->audios()->create([
                    'title' => $title,
                    'audio_path' => $path,
                ]);
            }
        }

        return back()->with('success', 'Lesson updated successfully!');
    }

    /**
     * Remove the specified lesson from storage.
     */
    public function destroy(Lesson $lesson)
    {
        // Delete all images from storage and database
        foreach ($lesson->images as $image) {
            Storage::disk('public')->delete($image->image_path);
            $image->delete();
        }

        // Delete all audios from storage and database
        foreach ($lesson->audios as $audio) {
            Storage::disk('public')->delete($audio->audio_path);
            $audio->delete();
        }

        $lesson->delete();

        return back()->with('success', 'Lesson deleted from adventure.');
    }

    /**
     * Update an individual audio file's title.
     */
    public function updateAudioTitle(Request $request, LessonAudio $audio)
    {
        $request->validate([
            'title' => 'required|string|max:255',
        ]);

        $audio->update([
            'title' => $request->title,
        ]);

        return back()->with('success', 'Audio title updated!');
    }

    /**
     * Delete an individual audio file.
     */
    public function destroyAudio(LessonAudio $audio)
    {
        Storage::disk('public')->delete($audio->audio_path);
        $audio->delete();

        return back()->with('success', 'Audio track deleted.');
    }

    /**
     * Delete an individual image file.
     */
    public function destroyImage(LessonImage $image)
    {
        Storage::disk('public')->delete($image->image_path);
        $image->delete();

        return back()->with('success', 'Image deleted.');
    }
}
