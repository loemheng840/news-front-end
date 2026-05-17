"use client";

import { useState } from "react";
import { useAuth } from "@/components/auth-provider";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Loader2, Save, User } from "lucide-react";
import { useGetProfileQuery, useUpdateProfileMutation } from "@/lib/redux/news-api";
import { redirect } from "next/navigation";

export default function ProfilePage() {
    const { user, isLoading: authLoading } = useAuth();
    const { data: profile, isLoading: profileLoading } = useGetProfileQuery(undefined, { skip: !user });
    const [updateProfile, { isLoading: updating }] = useUpdateProfileMutation();

    const [bio, setBio] = useState("");
    const [website, setWebsite] = useState("");
    const [location, setLocation] = useState("");
    const [twitter, setTwitter] = useState("");
    const [facebook, setFacebook] = useState("");
    const [linkedin, setLinkedin] = useState("");
    const [avatar, setAvatar] = useState<File | null>(null);
    const [success, setSuccess] = useState("");
    const [error, setError] = useState("");
    const [initialized, setInitialized] = useState(false);

    if (!initialized && profile) {
        setBio(profile.bio || "");
        setWebsite(profile.website || "");
        setLocation(profile.location || "");
        setTwitter(profile.social_links?.twitter || "");
        setFacebook(profile.social_links?.facebook || "");
        setLinkedin(profile.social_links?.linkedin || "");
        setInitialized(true);
    }

    if (authLoading || profileLoading) {
        return (
            <div className="flex min-h-screen items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin" />
            </div>
        );
    }

    if (!user) {
        redirect("/login");
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");
        setSuccess("");

        const formData = new FormData();
        formData.append("bio", bio);
        formData.append("website", website);
        formData.append("location", location);

        const socialLinks: Record<string, string> = {};
        if (twitter) socialLinks.twitter = twitter;
        if (facebook) socialLinks.facebook = facebook;
        if (linkedin) socialLinks.linkedin = linkedin;

        if (Object.keys(socialLinks).length > 0) {
            Object.entries(socialLinks).forEach(([key, value]) => {
                formData.append(`social_links[${key}]`, value);
            });
        }

        if (avatar) {
            formData.append("avatar", avatar);
        }

        try {
            await updateProfile(formData).unwrap();
            setSuccess("Profile updated successfully");
        } catch (err: unknown) {
            const error = err as { data?: { message?: string } };
            setError(error?.data?.message || "Failed to update profile");
        }
    };

    return (
        <div className="container mx-auto px-4 py-8 max-w-2xl">
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <User className="h-5 w-5" /> My Profile
                    </CardTitle>
                    <CardDescription>Manage your public profile information</CardDescription>
                </CardHeader>
                <CardContent>
                    {success && <div className="mb-4 p-3 bg-green-50 text-green-800 rounded-md text-sm">{success}</div>}
                    {error && <div className="mb-4 p-3 bg-red-50 text-red-800 rounded-md text-sm">{error}</div>}

                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="flex items-center gap-4">
                            <Avatar className="h-20 w-20">
                                <AvatarImage src={profile?.avatar ? `${process.env.NEXT_PUBLIC_API_URL?.replace("/api", "")}/storage/${profile.avatar}` : undefined} />
                                <AvatarFallback className="text-2xl">{user.name.charAt(0)}</AvatarFallback>
                            </Avatar>
                            <div>
                                <Label htmlFor="avatar">Profile Photo</Label>
                                <Input
                                    id="avatar"
                                    type="file"
                                    accept="image/jpeg,image/png,image/gif"
                                    onChange={(e) => setAvatar(e.target.files?.[0] || null)}
                                    className="mt-1"
                                />
                                <p className="text-xs text-muted-foreground mt-1">JPEG, PNG, or GIF. Max 2MB.</p>
                            </div>
                        </div>

                        <div>
                            <Label htmlFor="bio">Bio</Label>
                            <Textarea
                                id="bio"
                                value={bio}
                                onChange={(e) => setBio(e.target.value)}
                                placeholder="Tell us about yourself..."
                                maxLength={1000}
                                rows={4}
                            />
                            <p className="text-xs text-muted-foreground mt-1">{bio.length}/1000</p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <Label htmlFor="website">Website</Label>
                                <Input id="website" type="url" value={website} onChange={(e) => setWebsite(e.target.value)} placeholder="https://example.com" />
                            </div>
                            <div>
                                <Label htmlFor="location">Location</Label>
                                <Input id="location" value={location} onChange={(e) => setLocation(e.target.value)} placeholder="City, Country" />
                            </div>
                        </div>

                        <div className="space-y-3">
                            <h3 className="text-sm font-medium">Social Links</h3>
                            <div>
                                <Label htmlFor="twitter">Twitter</Label>
                                <Input id="twitter" value={twitter} onChange={(e) => setTwitter(e.target.value)} placeholder="@username" />
                            </div>
                            <div>
                                <Label htmlFor="facebook">Facebook</Label>
                                <Input id="facebook" value={facebook} onChange={(e) => setFacebook(e.target.value)} placeholder="Profile URL" />
                            </div>
                            <div>
                                <Label htmlFor="linkedin">LinkedIn</Label>
                                <Input id="linkedin" value={linkedin} onChange={(e) => setLinkedin(e.target.value)} placeholder="Profile URL" />
                            </div>
                        </div>

                        <Button type="submit" disabled={updating} className="w-full">
                            {updating ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Save className="h-4 w-4 mr-2" />}
                            Save Profile
                        </Button>
                    </form>
                </CardContent>
            </Card>
        </div>
    );
}
