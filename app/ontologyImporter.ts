import _ from "lodash";
import config from "./config";
import * as n3 from "n3";
import { Store, NamedNode } from "n3";
import { exec } from "child_process";
import type { Ontology, OntologyTerm } from "./core/ontologyRegister";
import { OntologyFormat, mkOntologyTerm } from "./core/ontologyRegister";

export type { Ontology } from "./core/ontologyRegister";
export { OntologyFormat } from "./core/ontologyRegister";

function convertToTtlPm(ontUrl:  string, format: OntologyFormat): Promise<string> {
  const cmd = config.environment === "production" ?
    `/jena/bin/riot --syntax=${format} --output=Turtle ${ontUrl}`
  : `docker run stain/jena riot --syntax=${format} --output=Turtle ${ontUrl}`;
  return new Promise((resolve, reject) => {
    exec(cmd, {maxBuffer: 50 * 1024 * 1024}, (error, stdout, stderr) => {
      if (error) {
        if (error.name === "RangeError") {
           reject("Ontology too big"); 
         } else {
           console.log(stderr);
           reject(stderr);
         }
      } else {
        resolve(stdout);
      }
    });
  });
}

function getOntologyUri(store: Store): string|null {
  const hasType = new NamedNode("http://www.w3.org/1999/02/22-rdf-syntax-ns#type");
  const ontology = new NamedNode("http://www.w3.org/2002/07/owl#Ontology");
  const uris = store.getSubjects(hasType, ontology, null);
  return uris.length === 0 ? null : uris[0].value;
}

function mkRdfsOTerm(store: Store, node: NamedNode): OntologyTerm|null {
  const rdfsLabel = new NamedNode("http://www.w3.org/2000/01/rdf-schema#label");
  const rdfsComment = new NamedNode("http://www.w3.org/2000/01/rdf-schema#comment");
  const labels = store.getObjects(node, rdfsLabel, null);
  const comment = store.getObjects(node, rdfsComment, null)[0]?.value || "";
  return (
    labels.length === 0 ?
      null
    : labels.length === 1 ?
      mkOntologyTerm(node.value, labels[0].value, comment)
    : (() => {
      const res = labels.find(l => (l as n3.Literal).language === "en");
      return (res ?
        mkOntologyTerm(node.value, res.value, comment)
      : null);
    })()
  );
}

function mkSkosOTerm(store: Store, node: NamedNode): OntologyTerm|null {
  const skosLabel = new NamedNode("http://www.w3.org/2004/02/skos/core#prefLabel");
  const skosNote = new NamedNode("http://www.w3.org/2004/02/skos/core#scopeNote");
  const labels = store.getObjects(node, skosLabel, null);
  const comment = store.getObjects(node, skosNote, null)[0]?.value || "";
  return (
    labels.length === 0 ?
      null
    : labels.length === 1 ?
      mkOntologyTerm(node.value, labels[0].value, comment)
    : (() => {
      const res = labels.find(l => (l as n3.Literal).language === "en");
      return (res ?
        mkOntologyTerm(node.value, res.value, comment)
      : null);
    })()
  );
}

function getSubClasses(store: Store, node: NamedNode): Array<NamedNode> {
  const subClassOf = new NamedNode("http://www.w3.org/2000/01/rdf-schema#subClassOf");
  const subClasses = store.getSubjects(subClassOf, node, null).filter(n3.Util.isNamedNode) as Array<NamedNode>;
  return subClasses.reduce(
    (res: Array<NamedNode>, sc) => [...res, ...getSubClasses(store, sc)],
    subClasses
  );
}

function getOwlOTermsFromOntology(store: Store): Array<OntologyTerm> {
  const owlThing = new NamedNode("http://www.w3.org/2002/07/owl#Thing");
  const owlIsType = new NamedNode("http://www.w3.org/1999/02/22-rdf-syntax-ns#type");
  const owlClass = new NamedNode("http://www.w3.org/2002/07/owl#Class");
  const rdfsClass = new NamedNode("http://www.w3.org/2000/01/rdf-schema#Class");
  // const allOTermNodes = getSubClasses(store, owlThing);
  const allOwlOTermNodes = store.getSubjects(owlIsType, owlClass, null).filter(n3.Util.isNamedNode) as Array<NamedNode>;
  const allRdfsOTermNodes = store.getSubjects(owlIsType, rdfsClass, null).filter(n3.Util.isNamedNode) as Array<NamedNode>;
  const allOTermNodes = [...allOwlOTermNodes, ...allRdfsOTermNodes];
  const oTerms = allOTermNodes.map(n => mkRdfsOTerm(store, n)).filter(t => t !== null) as Array<OntologyTerm>;
  const oTermsUniqueSorted = _.sortBy(_.uniqBy(oTerms, "label"), ["label"]);
  return oTermsUniqueSorted;
}

function getSkosOTermsFromOntology(store: Store): Array<OntologyTerm> {
  const owlIsType = new NamedNode("http://www.w3.org/1999/02/22-rdf-syntax-ns#type");
  const skosConcept = new NamedNode("http://www.w3.org/2004/02/skos/core#Concept");
  const allConceptNodes = store.getSubjects(owlIsType, skosConcept, null).filter(n3.Util.isNamedNode) as Array<NamedNode>;
  const oTerms = allConceptNodes.map(n => mkSkosOTerm(store, n)).filter(t => t !== null) as Array<OntologyTerm>;
  const oTermsUniqueSorted = _.sortBy(_.uniqBy(oTerms, "label"), ["label"]);
  return oTermsUniqueSorted;
}

export function mkOntologyPm(ontUrl: string, format: OntologyFormat, creatorId: string): Promise<Ontology> {
  return new Promise((resolve, reject) => {
    convertToTtlPm(ontUrl, format).then(
      ttl => {
        const parser = new n3.Parser();
        const quads = parser.parse(ttl);
        const store = new Store(quads);
        const ontUri = getOntologyUri(store);
        const owlOTerms = getOwlOTermsFromOntology(store);
        const skosOTerms = getSkosOTermsFromOntology(store);
        const oTerms = [...owlOTerms, ...skosOTerms];
        const noOfTerms = oTerms.length;
        oTerms.length > 0 ?
          resolve({ id: "", creatorId, uri: ontUri || ontUrl, noOfTerms, terms: oTerms })
        : reject("No terms were extracted from the ontology");
      },
      err => reject(err)
    );
  });
}
