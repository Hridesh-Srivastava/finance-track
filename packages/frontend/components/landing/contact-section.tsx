"use client";

import { useState } from "react";
import { Mail, MapPin, Phone } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { db } from "@/lib/firebase"; 
import { collection, addDoc, serverTimestamp } from "firebase/firestore";

export function ContactSection() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  });
  const [loading, setLoading] = useState(false);
  const [response, setResponse] = useState<{ type: "success" | "error"; message: string } | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.id]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setResponse(null);

    try {
     
      await addDoc(collection(db, "contactSubmissions"), {
        ...formData,
        createdAt: serverTimestamp(),
        status: "new",
      });

      setResponse({
        type: "success",
        message: "Thank you! Your message has been sent successfully.",
      });

      
      setFormData({
        name: "",
        email: "",
        subject: "",
        message: "",
      });
    } catch (error) {
      console.error("Error submitting contact form:", error);
      setResponse({
        type: "error",
        message: "Something went wrong. Please try again later.",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <section id="contact" className="w-full py-12 md:py-24 lg:py-32 bg-muted">
      <div className="container px-4 md:px-6">
        <div className="flex flex-col items-center justify-center space-y-4 text-center">
          <div className="space-y-2">
            <div className="inline-block rounded-lg bg-primary px-3 py-1 text-sm text-primary-foreground">
              Contact Us
            </div>
            <h2 className="text-3xl font-bold tracking-tighter md:text-4xl">
              Get in touch with our team
            </h2>
            <p className="max-w-[900px] text-muted-foreground md:text-xl">
              Have questions or feedback? We'd love to hear from you.
            </p>
          </div>
        </div>

        <div className="mx-auto mt-12 grid max-w-5xl gap-8 md:grid-cols-2">
          <Card>
            <CardContent className="p-6">
              <h3 className="text-xl font-bold mb-4">Send us a message</h3>
              <form className="space-y-4" onSubmit={handleSubmit}>
                <div className="grid gap-4 md:grid-cols-2">
                  <div>
                    <label htmlFor="name" className="block text-sm font-medium mb-1">
                      Name
                    </label>
                    <Input 
                      id="name" 
                      placeholder="Your name" 
                      value={formData.name}
                      onChange={handleChange} 
                      required 
                    />
                  </div>
                  <div>
                    <label htmlFor="email" className="block text-sm font-medium mb-1">
                      Email
                    </label>
                    <Input 
                      id="email" 
                      type="email" 
                      placeholder="Your email" 
                      value={formData.email}
                      onChange={handleChange} 
                      required 
                    />
                  </div>
                </div>
                <div>
                  <label htmlFor="subject" className="block text-sm font-medium mb-1">
                    Subject
                  </label>
                  <Input 
                    id="subject" 
                    placeholder="How can we help you?" 
                    value={formData.subject}
                    onChange={handleChange} 
                    required 
                  />
                </div>
                <div>
                  <label htmlFor="message" className="block text-sm font-medium mb-1">
                    Message
                  </label>
                  <Textarea 
                    id="message" 
                    placeholder="Your message" 
                    rows={4} 
                    value={formData.message}
                    onChange={handleChange} 
                    required 
                  />
                </div>
                <Button type="submit" className="w-full" disabled={loading}>
                  {loading ? "Sending..." : "Send Message"}
                </Button>
                {response && (
                  <p className={`text-center text-sm mt-2 ${
                    response.type === "success" ? "text-green-600" : "text-red-600"
                  }`}>
                    {response.message}
                  </p>
                )}
              </form>
            </CardContent>
          </Card>

          <div className="flex flex-col justify-center space-y-6">
            <div className="flex items-start space-x-4">
              <MapPin className="h-6 w-6 text-primary mt-0.5" />
              <div>
                <h4 className="font-bold">Our Location</h4>
                <p className="text-muted-foreground mt-1">
                Swami Rama Himalayan University
                  <br />
                  Jolly Grant, Dehradun
                  <br />
                  Uttarakhand, India - 248016
                </p>
              </div>
            </div>
            <div className="flex items-start space-x-4">
              <Mail className="h-6 w-6 text-primary mt-0.5" />
              <div>
                <h4 className="font-bold">Email Us</h4>
                <p className="text-muted-foreground mt-1">
                info@srhu.edu.in
                  <br />
                  sshset2013@gmail.com
                </p>
              </div>
            </div>
            <div className="flex items-start space-x-4">
              <Phone className="h-6 w-6 text-primary mt-0.5" />
              <div>
                <h4 className="font-bold">Call Us</h4>
                <p className="text-muted-foreground mt-1">
                01352471266
                    <br />
                     Monday - Friday: 9:00 AM - 5:00 PM
                    <br />
                    Saturday: 9:00 AM - 1:00 PM
                    <br />
                    Sunday: Closed
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}