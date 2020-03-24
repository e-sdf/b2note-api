import type { Request, Response } from "express";
import { Router } from "express";

const router = Router();

interface FileItem {
  name: string;
  pidUrl: string;
  subjectUrl: string;
}

const fileItems: FileItem[] = [
  {
    name: "Orthography-based dating and localisation of Middle Dutch charters",
    subjectUrl: "https://b2share.eudat.eu/records/b1092be3cd4844e0bffd7b669521ba3c",
    pidUrl: "http://hdl.handle.net/11304/3720bb44-831c-48f3-9847-6988a41236e1"
  },
  {
    name: "ImageJ plugin ColonyArea", 
    subjectUrl: "https://b2share.eudat.eu/records/39fa39965b314f658e4a198a78d7f6b5",
    pidUrl: "http://hdl.handle.net/11304/3522daa6-b988-11e3-8cd7-14feb57d12b9"
  },
  {
    name: "REST paper 2014",
    subjectUrl: "https://b2share.eudat.eu/records/5b1ac2030a9f4338bba9d92593e2e5e4",
    pidUrl: "http://hdl.handle.net/11304/6a9078c4-c3b0-11e3-8cd7-14feb57d12b9"
  }, 
  {
    name: "piSVM Analytics Runtimes JUDGE Cluster Rome Images 55 Features",
    subjectUrl: "https://b2share.eudat.eu/records/8f90692d770249f08e42d4613e91dbea",
    pidUrl: "http://hdl.handle.net/11304/69430fd2-e7d6-11e3-b2d7-14feb57d12b9"
  },
  {
    name: "GoNL SNPs and Indels release 5",
    subjectUrl: "https://b2share.eudat.eu/records/f253047b330449d69594f60aebbf3d62",
    pidUrl: "http://hdl.handle.net/11304/fe356a8e-3f2b-11e4-81ac-dcbd1b51435e"
  }, 
  {
    name: "Influence of smoking and obesity in sperm quality",
    subjectUrl: "https://b2share.eudat.eu/records/5a62838104c14932823cfd905eb438fc",
    pidUrl: "http://hdl.handle.net/11304/9061f60c-41cf-11e4-81ac-dcbd1b51435e"
  },
  {
    name: "Orthography-based dating and localisation of Middle Dutch charters",
    subjectUrl: "https://b2share.eudat.eu/records/b1092be3cd4844e0bffd7b669521ba3c",
    pidUrl: "http://hdl.handle.net/11304/3720bb44-831c-48f3-9847-6988a41236e1"
  }
];

router.get("/index.html", (req: Request, resp: Response) => {
  resp.render("index", { fileItems });
});

export default router;

