import { useState, useEffect, useMemo } from "react";
import { motion } from "framer-motion";
import { format, parseISO } from "date-fns";
import {
  Calendar,
  Users,
  DollarSign,
  MapPin,
  Mail,
  Phone,
  ArrowLeft,
  LogOut,
  Eye,
  RefreshCw,
  Check,
  X,
  Trash2,
} from "lucide-react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { mockBookings } from "@/data/bookings";
import { useLocations } from "@/hooks/useLocations";
import LocationsManager from "@/components/admin/LocationsManager";
import { useAuth } from "@/hooks/useAuth";
import { useAdmin } from "@/hooks/useAdmin";
import { useBookings, BookingRecord } from "@/hooks/useBookings";

const demoBookings: BookingRecord[] = mockBookings.map((b) => ({
  id: b.id,
  location_id: b.locationId,
  guest_name: b.guestName,
  email: b.email,
  phone: b.phone,
  check_in: b.checkIn.toISOString().slice(0, 10),
  check_out: b.checkOut.toISOString().slice(0, 10),
  guests: b.guests,
  status: b.status,
  notes: null,
  created_at: b.createdAt.toISOString(),
}));

const nightsBetween = (checkIn: string, checkOut: string) =>
  Math.max(
    1,
    Math.ceil(
      (parseISO(checkOut).getTime() - parseISO(checkIn).getTime()) / (1000 * 60 * 60 * 24)
    )
  );

const Admin = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const isDemo = searchParams.get("demo") === "true";
  const { user, loading, signOut } = useAuth();
  const { isAdmin, checking } = useAdmin(isDemo ? undefined : user?.id);
  const live = useBookings(!isDemo && isAdmin);
  const [selectedLocation, setSelectedLocation] = useState("all");
  const { locations } = useLocations();

  const getLocationById = (id: string) =>
    locations.find((l) => l.id === id);

  useEffect(() => {
    if (!loading && !user && !isDemo) {
      navigate("/auth");
    }
  }, [loading, user, navigate, isDemo]);

  const bookings = isDemo ? demoBookings : live.bookings;

  const filteredBookings = useMemo(
    () =>
      selectedLocation === "all"
        ? bookings
        : bookings.filter((b) => b.location_id === selectedLocation),
    [bookings, selectedLocation]
  );

  const stats = useMemo(() => {
    const today = new Date().toISOString().slice(0, 10);
    return {
      total: bookings.length,
      confirmed: bookings.filter((b) => b.status === "confirmed").length,
      pending: bookings.filter((b) => b.status === "pending").length,
      upcoming: bookings.filter((b) => b.check_in >= today && b.status !== "cancelled").length,
    };
  }, [bookings]);

  if ((loading || checking) && !isDemo) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-sm text-muted-foreground font-light">Loading...</p>
      </div>
    );
  }

  if (!isDemo && user && !isAdmin) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center gap-4 px-6 text-center">
        <h1 className="text-2xl font-light tracking-tight">Access restricted</h1>
        <p className="text-sm text-muted-foreground font-light max-w-sm">
          Your account ({user.email}) does not have admin access yet. Ask an existing
          administrator to grant you the admin role.
        </p>
        <div className="flex gap-3">
          <Button variant="outline" size="sm" onClick={() => navigate("/")} className="rounded-full text-[11px] uppercase tracking-wider font-normal">
            Back to site
          </Button>
          <Button size="sm" onClick={signOut} className="rounded-full text-[11px] uppercase tracking-wider font-normal">
            Sign out
          </Button>
        </div>
      </div>
    );
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "confirmed":
        return "bg-green-100 text-green-800 border-green-200";
      case "pending":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "cancelled":
        return "bg-red-100 text-red-800 border-red-200";
      default:
        return "bg-muted text-muted-foreground";
    }
  };

  const calculateRevenue = () =>
    filteredBookings
      .filter((b) => b.status !== "cancelled")
      .reduce((total, booking) => {
        const location = getLocationById(booking.location_id);
        if (!location) return total;
        return total + location.price * nightsBetween(booking.check_in, booking.check_out);
      }, 0);

  return (
    <div className="min-h-screen bg-background">
      <Navigation variant="dark" />

      <main className="pt-24 pb-20">
        <div className="container mx-auto px-6 lg:px-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="mb-12"
          >
            <div className="flex items-center justify-between mb-6">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate("/")}
                className="text-[11px] uppercase tracking-wider font-normal"
              >
                <ArrowLeft className="mr-2 h-3 w-3" />
                Back to Home
              </Button>
              <div className="flex items-center gap-2">
                {isDemo ? (
                  <Badge variant="outline" className="gap-1 text-xs font-light border-primary/30 text-primary">
                    <Eye className="h-3 w-3" />
                    Demo Mode
                  </Badge>
                ) : (
                  <>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={live.refresh}
                      className="text-[11px] uppercase tracking-wider font-normal"
                    >
                      <RefreshCw className="mr-2 h-3 w-3" />
                      Refresh
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={signOut}
                      className="text-[11px] uppercase tracking-wider font-normal text-destructive hover:text-destructive"
                    >
                      <LogOut className="mr-2 h-3 w-3" />
                      Sign Out
                    </Button>
                  </>
                )}
              </div>
            </div>

            <h1 className="text-3xl md:text-4xl font-light mb-3 tracking-tight">
              Admin Dashboard
            </h1>
            <p className="text-sm text-muted-foreground font-light">
              {isDemo
                ? "Sample data preview — sign in to manage real booking requests"
                : "Manage your property bookings and monitor performance"}
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10"
          >
            <Card className="p-6 border border-border shadow-soft">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                  <Calendar className="h-4 w-4 text-primary" />
                </div>
              </div>
              <p className="text-2xl font-light mb-1">{stats.total}</p>
              <p className="text-xs text-muted-foreground font-light">Total Bookings</p>
            </Card>

            <Card className="p-6 border border-border shadow-soft">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center">
                  <Users className="h-4 w-4 text-green-600" />
                </div>
              </div>
              <p className="text-2xl font-light mb-1">{stats.upcoming}</p>
              <p className="text-xs text-muted-foreground font-light">Upcoming</p>
            </Card>

            <Card className="p-6 border border-border shadow-soft">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-full bg-yellow-100 flex items-center justify-center">
                  <Calendar className="h-4 w-4 text-yellow-600" />
                </div>
              </div>
              <p className="text-2xl font-light mb-1">{stats.pending}</p>
              <p className="text-xs text-muted-foreground font-light">Pending</p>
            </Card>

            <Card className="p-6 border border-border shadow-soft">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                  <DollarSign className="h-4 w-4 text-primary" />
                </div>
              </div>
              <p className="text-2xl font-light mb-1">${calculateRevenue().toLocaleString()}</p>
              <p className="text-xs text-muted-foreground font-light">Est. Revenue</p>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <Tabs defaultValue="all" onValueChange={setSelectedLocation}>
              <TabsList className="mb-6 flex-wrap h-auto gap-2 bg-transparent p-0">
                <TabsTrigger
                  value="all"
                  className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground rounded-full px-4 py-1.5 text-xs font-light border border-border"
                >
                  All Locations
                </TabsTrigger>
                {locations.map((loc) => (
                  <TabsTrigger
                    key={loc.id}
                    value={loc.slug}
                    className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground rounded-full px-4 py-1.5 text-xs font-light border border-border"
                  >
                    {loc.name}
                  </TabsTrigger>
                ))}
              </TabsList>

              <TabsContent value={selectedLocation} className="mt-0">
                <Card className="border border-border shadow-soft overflow-hidden">
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow className="border-border">
                          <TableHead className="text-[11px] uppercase tracking-wider font-normal">Guest</TableHead>
                          <TableHead className="text-[11px] uppercase tracking-wider font-normal">Location</TableHead>
                          <TableHead className="text-[11px] uppercase tracking-wider font-normal">Dates</TableHead>
                          <TableHead className="text-[11px] uppercase tracking-wider font-normal">Guests</TableHead>
                          <TableHead className="text-[11px] uppercase tracking-wider font-normal">Status</TableHead>
                          <TableHead className="text-[11px] uppercase tracking-wider font-normal">Contact</TableHead>
                          {!isDemo && (
                            <TableHead className="text-[11px] uppercase tracking-wider font-normal text-right">Actions</TableHead>
                          )}
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {filteredBookings.map((booking) => {
                        
                          return (
                            <TableRow key={booking.id} className="border-border">
                              <TableCell>
                                <div>
                                  <p className="text-sm font-normal">{booking.guest_name}</p>
                                  {booking.notes && (
                                    <p className="text-xs text-muted-foreground font-light">{booking.notes}</p>
                                  )}
                                </div>
                              </TableCell>
                              <TableCell>
                                <div className="flex items-center gap-2">
                                  <MapPin className="h-3 w-3 text-muted-foreground" />
                                  <span className="text-sm font-light">
  {booking.locations?.name || booking.location_id}
</span>
                                </div>
                              </TableCell>
                              <TableCell>
                                <div className="text-sm font-light">
                                  <p>
                                    {format(parseISO(booking.check_in), "MMM d")} -{" "}
                                    {format(parseISO(booking.check_out), "MMM d, yyyy")}
                                  </p>
                                  <p className="text-xs text-muted-foreground">
                                    {nightsBetween(booking.check_in, booking.check_out)} nights
                                  </p>
                                </div>
                              </TableCell>
                              <TableCell>
                                <div className="flex items-center gap-1">
                                  <Users className="h-3 w-3 text-muted-foreground" />
                                  <span className="text-sm font-light">{booking.guests}</span>
                                </div>
                              </TableCell>
                              <TableCell>
                                <Badge
                                  variant="outline"
                                  className={`text-xs font-light capitalize ${getStatusColor(booking.status)}`}
                                >
                                  {booking.status}
                                </Badge>
                              </TableCell>
                              <TableCell>
                                <div className="flex flex-col gap-1">
                                  <a
                                    href={`mailto:${booking.email}`}
                                    className="text-xs text-muted-foreground hover:text-primary font-light flex items-center gap-1"
                                  >
                                    <Mail className="h-3 w-3" />
                                    {booking.email}
                                  </a>
                                  {booking.phone && (
                                    <a
                                      href={`tel:${booking.phone}`}
                                      className="text-xs text-muted-foreground hover:text-primary font-light flex items-center gap-1"
                                    >
                                      <Phone className="h-3 w-3" />
                                      {booking.phone}
                                    </a>
                                  )}
                                </div>
                              </TableCell>
                              {!isDemo && (
                                <TableCell className="text-right">
                                  <div className="flex items-center justify-end gap-1">
                                    <Button
                                      variant="ghost"
                                      size="icon"
                                      title="Confirm"
                                      onClick={() => live.updateStatus(booking.id, "confirmed")}
                                      className="h-7 w-7 text-green-600 hover:text-green-700"
                                    >
                                      <Check className="h-3.5 w-3.5" />
                                    </Button>
                                    <Button
                                      variant="ghost"
                                      size="icon"
                                      title="Cancel"
                                      onClick={() => live.updateStatus(booking.id, "cancelled")}
                                      className="h-7 w-7 text-yellow-600 hover:text-yellow-700"
                                    >
                                      <X className="h-3.5 w-3.5" />
                                    </Button>
                                    <Button
                                      variant="ghost"
                                      size="icon"
                                      title="Delete"
                                      onClick={() => live.deleteBooking(booking.id)}
                                      className="h-7 w-7 text-destructive hover:text-destructive"
                                    >
                                      <Trash2 className="h-3.5 w-3.5" />
                                    </Button>
                                  </div>
                                </TableCell>
                              )}
                            </TableRow>
                          );
                        })}
                      </TableBody>
                    </Table>
                  </div>

                  {filteredBookings.length === 0 && (
                    <div className="text-center py-12">
                      <p className="text-sm text-muted-foreground font-light">
                        {live.loading && !isDemo ? "Loading bookings..." : "No bookings found for this location"}
                      </p>
                    </div>
                  )}
                </Card>
              </TabsContent>
            </Tabs>
          </motion.div>

          {!isDemo && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="mt-16"
            >
              <LocationsManager />
            </motion.div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Admin;
